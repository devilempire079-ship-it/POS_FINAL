import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';

const useWebSocket = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Generate unique terminal ID
  const terminalId = useRef(`terminal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      // Use Vite's import.meta.env instead of Node.js process.env
      const wsPort = import.meta.env?.VITE_WEBSOCKET_PORT || '3002';
      const wsUrl = `ws://localhost:${wsPort}`;
      console.log(`🔗 Connecting to WebSocket: ${wsUrl}`);

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;

        // Send terminal identification
        const terminalInfo = {
          type: 'TERMINAL_INFO',
          data: {
            name: `Terminal ${terminalId.current.slice(-4)}`,
            location: window.location.hostname,
            user: user?.name || 'Unknown User',
            userAgent: navigator.userAgent,
            terminalId: terminalId.current
          }
        };

        wsRef.current.send(JSON.stringify(terminalInfo));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', message.type);
          setLastMessage(message);

          // Handle different message types
          switch (message.type) {
            case 'CONNECTED':
              console.log('🎯 Terminal connected to server:', message.data.terminalId);
              break;

            case 'PONG':
              // Handle ping response
              break;

            default:
              // Dispatch custom event for other components to listen to
              window.dispatchEvent(new CustomEvent('websocket-message', {
                detail: message
              }));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');

        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);

          console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionStatus('error');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
    }
  }, [user]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnecting');
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  const sendPing = useCallback(() => {
    sendMessage({ type: 'PING', timestamp: new Date() });
  }, [sendMessage]);

  // Connect on mount and when user changes
  useEffect(() => {
    if (user) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user, connect, disconnect]);

  // Set up ping interval to keep connection alive
  useEffect(() => {
    if (isConnected) {
      const pingInterval = setInterval(() => {
        sendPing();
      }, 30000); // Ping every 30 seconds

      return () => clearInterval(pingInterval);
    }
  }, [isConnected, sendPing]);

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    terminalId: terminalId.current,
    sendMessage,
    sendPing,
    connect,
    disconnect
  };
};

export default useWebSocket;
