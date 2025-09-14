import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  PlusCircle,
  Minus,
  Edit,
  Trash2,
  Users,
  Save,
  X,
  Grid3X3,
  Settings,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Copy,
  Eye,
  EyeOff,
  MapPin,
  Building,
  Home,
  Trees,
  ArrowUpDown,
  Building2
} from 'lucide-react';
import { useTableContext } from '../../hooks/TableContext';
import { useBusinessType } from '../../hooks/useBusinessType';

const TableManagement = () => {
  // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL - NO CONDITIONAL HOOKS!

  // Use business type hook
  const { businessType, loading: businessTypeLoading } = useBusinessType();

  // Use shared table management hook
  const {
    tables,
    createTable,
    updateTable,
    updateTableStatus,
    updateOccupiedSeats,
    deleteTable,
    getTableStats
  } = useTableContext();

  // Simplified floor management for demo (in real app this would be more complex)
  const [activeFloor, setActiveFloor] = useState(1);
  const [floors, setFloors] = useState([
    {
      id: 1,
      name: 'Ground Floor',
      type: 'indoor',
      maxTables: 25,
      tables: [],
      sections: [
        { id: 1, name: 'Main Dining', x: 50, y: 50, width: 300, height: 200, color: 'blue' },
        { id: 2, name: 'Bar Area', x: 400, y: 50, width: 200, height: 150, color: 'purple' },
        { id: 3, name: 'VIP Section', x: 650, y: 50, width: 180, height: 180, color: 'orange' }
      ]
    },
    {
      id: 2,
      name: 'Rooftop Terrace',
      type: 'outdoor',
      maxTables: 15,
      tables: [],
      sections: [
        { id: 4, name: 'Garden Dining', x: 50, y: 50, width: 250, height: 180, color: 'green' },
        { id: 5, name: 'Sky Lounge', x: 350, y: 50, width: 200, height: 150, color: 'teal' }
      ]
    }
  ]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [layoutMode, setLayoutMode] = useState(false);
  const [showAddTable, setShowAddTable] = useState(false);
  const [showAddFloor, setShowAddFloor] = useState(false);
  const [showFloorSettings, setShowFloorSettings] = useState(false);

  // Layout controls
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showSectionLabels, setShowSectionLabels] = useState(true);
  const [showTableNumbers, setShowTableNumbers] = useState(true);

  // Drag and drop state
  const [draggedTable, setDraggedTable] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragTargetFloor, setDragTargetFloor] = useState(null);
  const [hoveredTable, setHoveredTable] = useState(null);

  // Section management
  const [resizingSection, setResizingSection] = useState(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [originalSection, setOriginalSection] = useState(null);
  const [draggingSection, setDraggingSection] = useState(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');

  // Move menu
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [moveMenuPosition, setMoveMenuPosition] = useState({ x: 0, y: 0 });

  // New table form
  const [newTable, setNewTable] = useState({
    number: '',
    capacity: 4,
    section: '',
    shape: 'round'
  });

  // New floor form
  const [newFloor, setNewFloor] = useState({
    name: '',
    type: 'indoor',
    maxTables: 20
  });

  // Restaurant type state
  const [restaurantType, setRestaurantType] = useState('casual');

  const layoutRef = useRef(null);
  const GRID_SIZE = 25;
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 2.5;

  // Effects must be called unconditionally
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedTable) return;

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (e.target.tagName !== 'INPUT') {
            removeTable(selectedTable.id);
            setSelectedTable(null);
          }
          break;
        case 'Escape':
          setSelectedTable(null);
          setShowMoveMenu(false);
          break;
        case 'm':
        case 'M':
          if (layoutMode && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            const rect = layoutRef.current?.getBoundingClientRect();
            const tableElement = document.querySelector(`[data-table-id="${selectedTable.id}"]`);
            if (tableElement) {
              const tableRect = tableElement.getBoundingClientRect();
              setMoveMenuPosition({
                x: tableRect.left - rect.left + tableRect.width / 2,
                y: tableRect.top - rect.top - 10
              });
              setShowMoveMenu(true);
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTable, layoutMode]);

  // Mouse event listeners for drag and drop and section resizing
  useEffect(() => {
    if (layoutMode) {
      const handleMouseMoveGlobal = (e) => {
        handleMouseMove(e);
        handleSectionResize(e);
        handleSectionDrag(e);
      };

      const handleMouseUpGlobal = (e) => {
        handleMouseUp(e);
        stopSectionResize();
        stopSectionDrag();
      };

      window.addEventListener('mousemove', handleMouseMoveGlobal);
      window.addEventListener('mouseup', handleMouseUpGlobal);

      return () => {
        window.removeEventListener('mousemove', handleMouseMoveGlobal);
        window.removeEventListener('mouseup', handleMouseUpGlobal);
      };
    }
  }, [draggedTable, layoutMode, dragOffset, showGrid, resizingSection, originalSection, resizeStart, draggingSection]);

  // Click outside handler for move menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMoveMenu && !e.target.closest('.move-menu')) {
        setShowMoveMenu(false);
      }
    };

    if (showMoveMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMoveMenu]);

  const currentFloor = floors.find(f => f.id === activeFloor);

  // Check if business type is restaurant
  const isRestaurant = businessType?.code === 'restaurant';

  // CONDITIONAL RENDERING INSTEAD OF CONDITIONAL HOOKS
  if (businessTypeLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business type...</p>
        </div>
      </div>
    );
  }

  if (!isRestaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
            <div className="text-6xl mb-4">🏪</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Restaurant Features</h2>
            <p className="text-gray-600 mb-4">
              Table management is only available for restaurant business type.
            </p>
            <p className="text-sm text-gray-500">
              Current business type: {businessType?.name || 'Not set'}
            </p>
            <div className="mt-4">
              <p className="text-xs text-gray-400">
                Go to Settings → Business Type → Select "Restaurant"
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const addTable = () => {
    if (!newTable.number) return;

    const tableData = {
      number: parseInt(newTable.number),
      capacity: newTable.capacity,
      status: 'available',
      section: newTable.section || 'Main Dining',
      shape: newTable.shape || 'round',
      floor: activeFloor,
      position: { x: Math.random() * 300 + 50, y: Math.random() * 200 + 50 }
    };

    const result = createTable(tableData);
    if (result.success) {
      setNewTable({ number: '', capacity: 4, section: 'Main Dining', shape: 'round' });
      setShowAddTable(false);
    }
  };

  const removeTable = (tableId) => {
    const result = deleteTable(tableId);
    if (result.success && selectedTable?.id === tableId) {
      setSelectedTable(null);
    }
  };

  const updateTableCapacity = (tableId, newCapacity) => {
    updateTable(tableId, { capacity: newCapacity });
  };

  const updateTableSection = (tableId, newSection) => {
    updateTable(tableId, { section: newSection });
  };

  const addSection = () => {
    if (!newSectionName.trim()) return;

    const newSection = {
      id: Date.now(),
      name: newSectionName.trim(),
      x: Math.random() * 200 + 50,
      y: Math.random() * 150 + 50,
      width: 120,
      height: 100,
      color: ['blue', 'purple', 'green', 'orange'][Math.floor(Math.random() * 4)]
    };

    setFloors(floors.map(floor =>
      floor.id === activeFloor
        ? { ...floor, sections: [...floor.sections, newSection] }
        : floor
    ));

    // Reset and close modal
    setNewSectionName('');
    setShowAddSection(false);
  };

  const getSectionColor = (section) => {
    const colors = {
      'Main Dining': 'bg-blue-100 text-blue-800',
      'Bar': 'bg-purple-100 text-purple-800',
      'Patio': 'bg-green-100 text-green-800',
      'Private Room': 'bg-orange-100 text-orange-800'
    };
    return colors[section] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      'available': 'border-emerald-400 bg-emerald-50 shadow-emerald-100',
      'occupied': 'border-red-400 bg-red-50 shadow-red-100',
      'reserved': 'border-amber-400 bg-amber-50 shadow-amber-100',
      'cleaning': 'border-blue-400 bg-blue-50 shadow-blue-100'
    };
    return colors[status] || 'border-gray-300 bg-gray-50';
  };

  const getTableShape = (shape, size) => {
    const shapes = {
      'round': `border-radius: 50%; width: ${size}px; height: ${size}px;`,
      'square': `border-radius: 8px; width: ${size}px; height: ${size}px;`,
      'oval': `border-radius: 50px; width: ${size * 1.3}px; height: ${size}px;`,
      'rectangular': `border-radius: 8px; width: ${size * 1.5}px; height: ${size * 0.8}px;`,
      'high-top': `border-radius: 50%; width: ${size * 0.8}px; height: ${size * 0.8}px; border-width: 3px;`
    };
    return shapes[shape] || shapes.round;
  };

  const getTableSize = (capacity) => {
    const baseSize = 50;
    const scaleFactor = Math.max(0.8, Math.min(1.6, capacity / 4));
    return Math.round(baseSize * scaleFactor);
  };

  // Enhanced layout functions
  const snapToGrid = (position) => {
    return {
      x: Math.round(position.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(position.y / GRID_SIZE) * GRID_SIZE
    };
  };

  const updateTablePosition = (tableId, newPosition) => {
    const snappedPosition = showGrid ? snapToGrid(newPosition) : newPosition;
    updateTable(tableId, { position: snappedPosition });
  };

  // Cross-floor table moving
  const moveTableToFloor = (tableId, targetFloorId) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    // Update table floor
    updateTable(tableId, { floor: targetFloorId });

    // Switch to target floor
    setActiveFloor(targetFloorId);
    setSelectedTable(table);
  };

  // Section resizing functionality
  const startSectionResize = (e, section, direction) => {
    e.preventDefault();
    e.stopPropagation();

    setResizingSection({ section, direction });
    setResizeStart({ x: e.clientX, y: e.clientY });
    setOriginalSection({ ...section });
  };

  const handleSectionResize = (e) => {
    if (!resizingSection || !originalSection) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    const { direction } = resizingSection;

    let newWidth = originalSection.width;
    let newHeight = originalSection.height;
    let newX = originalSection.x;
    let newY = originalSection.y;

    // Calculate new dimensions based on resize direction
    switch (direction) {
      case 'nw':
        newWidth = Math.max(50, originalSection.width - deltaX);
        newHeight = Math.max(50, originalSection.height - deltaY);
        newX = originalSection.x + (originalSection.width - newWidth);
        newY = originalSection.y + (originalSection.height - newHeight);
        break;
      case 'ne':
        newWidth = Math.max(50, originalSection.width + deltaX);
        newHeight = Math.max(50, originalSection.height - deltaY);
        newY = originalSection.y + (originalSection.height - newHeight);
        break;
      case 'sw':
        newWidth = Math.max(50, originalSection.width - deltaX);
        newHeight = Math.max(50, originalSection.height + deltaY);
        newX = originalSection.x + (originalSection.width - newWidth);
        break;
      case 'se':
        newWidth = Math.max(50, originalSection.width + deltaX);
        newHeight = Math.max(50, originalSection.height + deltaY);
        break;
      case 'n':
        newHeight = Math.max(50, originalSection.height - deltaY);
        newY = originalSection.y + (originalSection.height - newHeight);
        break;
      case 's':
        newHeight = Math.max(50, originalSection.height + deltaY);
        break;
      case 'w':
        newWidth = Math.max(50, originalSection.width - deltaX);
        newX = originalSection.x + (originalSection.width - newWidth);
        break;
      case 'e':
        newWidth = Math.max(50, originalSection.width + deltaX);
        break;
    }

    // Update section in current floor
    setFloors(floors.map(floor =>
      floor.id === activeFloor
        ? {
            ...floor,
            sections: floor.sections.map(section =>
              section.id === resizingSection.section.id
                ? { ...section, width: newWidth, height: newHeight, x: newX, y: newY }
                : section
            )
          }
        : floor
    ));
  };

  const stopSectionResize = () => {
    setResizingSection(null);
    setOriginalSection(null);
  };

  // Section movement functionality
  const startSectionDrag = (e, section) => {
    if (e.target !== e.currentTarget) return; // Only drag on section body, not handles

    e.preventDefault();
    const rect = layoutRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - section.x;
    const offsetY = e.clientY - rect.top - section.y;

    setDraggingSection(section);
    setDragOffset({ x: offsetX, y: offsetY });
    setSelectedSection(section);
  };

  const handleSectionDrag = (e) => {
    if (!draggingSection) return;

    const rect = layoutRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;

    // Constrain to layout bounds
    const constrainedX = Math.max(0, Math.min(newX, rect.width - draggingSection.width));
    const constrainedY = Math.max(0, Math.min(newY, rect.height - draggingSection.height));

    // Update section position in current floor
    setFloors(floors.map(floor =>
      floor.id === activeFloor
        ? {
            ...floor,
            sections: floor.sections.map(section =>
              section.id === draggingSection.id
                ? { ...section, x: constrainedX, y: constrainedY }
                : section
            )
          }
        : floor
    ));
  };

  const stopSectionDrag = () => {
    setDraggingSection(null);
    setSelectedSection(null);
  };

  const handleMouseDown = (e, table) => {
    if (!layoutMode) return;

    e.preventDefault();
    e.stopPropagation();

    const rect = layoutRef.current.getBoundingClientRect();
    const tableSize = getTableSize(table.capacity);
    const tableCenterX = table.position.x + tableSize / 2;
    const tableCenterY = table.position.y + tableSize / 2;

    const offsetX = (e.clientX - rect.left) / zoom - tableCenterX;
    const offsetY = (e.clientY - rect.top) / zoom - tableCenterY;

    setDraggedTable(table);
    setDragOffset({ x: offsetX, y: offsetY });
    setSelectedTable(table);
  };

  const handleMouseMove = (e) => {
    if (!draggedTable || !layoutMode) return;

    const rect = layoutRef.current.getBoundingClientRect();
    const newX = (e.clientX - rect.left) / zoom - dragOffset.x;
    const newY = (e.clientY - rect.top) / zoom - dragOffset.y;

    // Check if dragging near floor tabs (top of screen)
    const isNearFloorTabs = e.clientY < 120; // Top 120px area for floor tabs
    if (isNearFloorTabs) {
      // Find closest floor tab
      const floorTabs = floors.filter(f => f.id !== activeFloor);
      let closestFloor = null;
      let minDistance = Infinity;

      floorTabs.forEach((floor, index) => {
        // Calculate actual tab position
        const tabX = 200 + (index * 200); // Approximate tab positions
        const distance = Math.abs(e.clientX - tabX);
        if (distance < minDistance && distance < 100) {
          minDistance = distance;
          closestFloor = floor;
        }
      });

      setDragTargetFloor(closestFloor?.id || null);
    } else {
      setDragTargetFloor(null);
    }

    // Keep tables within visible canvas bounds
    let constrainedX = newX;
    let constrainedY = newY;

    const canvasRect = layoutRef.current?.getBoundingClientRect();
    if (canvasRect) {
      const tableSize = getTableSize(draggedTable.capacity);
      const maxX = canvasRect.width / zoom - tableSize;
      const maxY = canvasRect.height / zoom - tableSize;
      constrainedX = Math.max(0, Math.min(newX, maxX));
      constrainedY = Math.max(0, Math.min(newY, maxY));
    }

    updateTablePosition(draggedTable.id, { x: constrainedX, y: constrainedY });
  };

  const handleMouseUp = () => {
    // Handle cross-floor drop
    if (draggedTable && dragTargetFloor) {
      moveTableToFloor(draggedTable.id, dragTargetFloor);
    }

    setDraggedTable(null);
    setDragOffset({ x: 0, y: 0 });
    setDragTargetFloor(null);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, MIN_ZOOM));
  };

  const resetZoom = () => {
    setZoom(1);
  };

  const toggleGrid = () => {
    setShowGrid(!showGrid);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedTable) return;

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (e.target.tagName !== 'INPUT') {
            removeTable(selectedTable.id);
            setSelectedTable(null);
          }
          break;
        case 'Escape':
          setSelectedTable(null);
          setShowMoveMenu(false);
          break;
        case 'm':
        case 'M':
          if (layoutMode && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            const rect = layoutRef.current.getBoundingClientRect();
            const tableElement = document.querySelector(`[data-table-id="${selectedTable.id}"]`);
            if (tableElement) {
              const tableRect = tableElement.getBoundingClientRect();
              setMoveMenuPosition({
                x: tableRect.left - rect.left + tableRect.width / 2,
                y: tableRect.top - rect.top - 10
              });
              setShowMoveMenu(true);
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTable, layoutMode]);

  // Mouse event listeners for drag and drop and section resizing
  useEffect(() => {
    if (layoutMode) {
      const handleMouseMoveGlobal = (e) => {
        handleMouseMove(e);
        handleSectionResize(e);
        handleSectionDrag(e);
      };

      const handleMouseUpGlobal = (e) => {
        handleMouseUp(e);
        stopSectionResize();
        stopSectionDrag();
      };

      window.addEventListener('mousemove', handleMouseMoveGlobal);
      window.addEventListener('mouseup', handleMouseUpGlobal);

      return () => {
        window.removeEventListener('mousemove', handleMouseMoveGlobal);
        window.removeEventListener('mouseup', handleMouseUpGlobal);
      };
    }
  }, [draggedTable, layoutMode, dragOffset, showGrid, resizingSection, originalSection, resizeStart, draggingSection]);

  // Click outside handler for move menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMoveMenu && !e.target.closest('.move-menu')) {
        setShowMoveMenu(false);
      }
    };

    if (showMoveMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMoveMenu]);

  return (
    <div className="space-y-6">

      {/* Professional Header */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Grid3X3 className="w-8 h-8 mr-3 text-blue-600" />
              Table Management System
            </h1>
            <p className="text-lg text-gray-600">
              Professional multi-floor restaurant layout management
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {floors.length} Floors
              </span>
              <span className="flex items-center">
                <Grid3X3 className="w-4 h-4 mr-1" />
                {tables.length} Tables
              </span>
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {tables.reduce((sum, t) => sum + t.capacity, 0)} Seats
              </span>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setLayoutMode(!layoutMode)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center ${layoutMode ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700 transform hover:scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <Settings className="w-5 h-5 mr-2" />
              {layoutMode ? 'Exit Layout Mode' : 'Layout Mode'}
            </button>

            <button
              onClick={() => {
                setNewSectionName('');
                setShowAddSection(true);
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all duration-200 flex items-center hover:scale-105 transform"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Add Section
            </button>

            <button
              onClick={() => setShowAddTable(true)}
              className="px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-all duration-200 flex items-center hover:scale-105 transform"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Table
            </button>
          </div>
        </div>
      </div>

      {/* Sections Overview - Floor Specific */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {floors.find(f => f.id === activeFloor)?.sections.map(section => {
          const sectionTables = tables.filter(table => (table.floor || 1) === activeFloor && table.section === section.name);
          const occupiedTables = sectionTables.filter(table => table.status === 'occupied').length;

          return (
            <div key={section.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{section.name}</h3>
                <span className={`px-2 py-1 rounded text-xs ${getSectionColor(section.name)}`}>
                  {sectionTables.length} tables
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <div>Occupied: {occupiedTables}/{sectionTables.length}</div>
                <div>Total Seats: {sectionTables.reduce((sum, table) => sum + table.capacity, 0)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Universal Floor Layout System */}
      <div className="bg-white rounded-lg shadow">
        {/* Professional Floor Navigation */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-gray-900">Floor Management</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Grid3X3 className="w-4 h-4 mr-1" />
                    {floors.length} Floors
                  </span>
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {tables.reduce((sum, t) => sum + t.capacity, 0)} Total Seats
                  </span>
                </div>
              </div>

              {/* Restaurant Type Selector */}
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">Restaurant Type:</span>
                <select
                  value={restaurantType}
                  onChange={(e) => setRestaurantType(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="cafe">☕ Cafe</option>
                  <option value="casual">🍽️ Casual Dining</option>
                  <option value="fine-dining">🥂 Fine Dining</option>
                  <option value="bar">🍺 Bar & Grill</option>
                  <option value="banquet">🏛️ Banquet Hall</option>
                </select>
              </div>
            </div>

            {/* Enhanced Floor Tabs */}
            <div className="flex items-center space-x-2">
              {floors.map(floor => {
                const isActive = activeFloor === floor.id;
                const floorStats = {
                  totalTables: floor.tables.length,
                  occupiedTables: floor.tables.filter(t => t.status === 'occupied').length,
                  totalSeats: floor.tables.reduce((sum, t) => sum + t.capacity, 0),
                  utilization: floor.tables.length > 0 ?
                    Math.round((floor.tables.filter(t => t.status === 'occupied').length / floor.tables.length) * 100) : 0
                };

                return (
                  <button
                    key={floor.id}
                    onClick={() => setActiveFloor(floor.id)}
                    onDoubleClick={() => {
                      const newName = prompt('Rename floor:', floor.name);
                      if (newName && newName.trim()) {
                        setFloors(floors.map(f =>
                          f.id === floor.id ? { ...f, name: newName.trim() } : f
                        ));
                      }
                    }}
                    className={`relative px-6 py-4 rounded-xl font-medium transition-all duration-200 border-2 ${isActive ? 'bg-blue-600 text-white border-blue-600 shadow-lg transform scale-105' : dragTargetFloor === floor.id ? 'bg-green-500 text-white border-green-500 shadow-xl scale-105' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md'}`}
                    title="Double-click to rename"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-left">
                        <div className="font-semibold text-sm">{floor.name}</div>
                        <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                          {floorStats.totalTables} tables • {floorStats.totalSeats} seats
                        </div>
                        <div className={`text-xs font-medium ${isActive ? 'text-blue-100' : 'text-gray-600'}`}>
                          {floorStats.utilization}% occupied
                        </div>
                      </div>
                      <div className="flex flex-col items-center space-y-1">
                        <span className="text-lg">
                          {floor.type === 'indoor' ? '🏠' : '🌳'}
                        </span>
                        {isActive && (
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        )}
                        {dragTargetFloor === floor.id && (
                          <span className="text-xs animate-bounce">🎯</span>
                        )}
                      </div>
                    </div>

                    {/* Utilization Indicator */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-xl overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${floorStats.utilization > 80 ? 'bg-red-500' : floorStats.utilization > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${floorStats.utilization}%` }}
                      ></div>
                    </div>
                  </button>
                );
              })}

              {/* Add Floor Button */}
              <button
                onClick={() => {
                  const newFloor = {
                    id: Date.now(),
                    name: `Floor ${floors.length + 1}`,
                    type: 'indoor',
                    maxTables: 20,
                    sections: [],
                    dimensions: { width: 800, height: 600 },
                    tables: []
                  };
                  setFloors([...floors, newFloor]);
                  setActiveFloor(newFloor.id);
                }}
                className="px-4 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 flex items-center justify-center hover:scale-105 shadow-lg"
                title="Add new floor"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Layout Header with Controls */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-lg font-semibold">
                {floors.find(f => f.id === activeFloor)?.name || 'Floor Layout'}
              </h2>
              <p className="text-sm text-gray-600">
                {floors.find(f => f.id === activeFloor)?.type === 'indoor' ? '🏠 Indoor' : '🌳 Outdoor'} Environment
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Zoom: {Math.round(zoom * 100)}%</span>
              <button
                onClick={handleZoomOut}
                className="p-1 hover:bg-gray-100 rounded"
                disabled={zoom <= MIN_ZOOM}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={resetZoom}
                className="px-2 py-1 text-xs hover:bg-gray-100 rounded"
              >
                Reset
              </button>
              <button
                onClick={handleZoomIn}
                className="p-1 hover:bg-gray-100 rounded"
                disabled={zoom >= MAX_ZOOM}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={toggleGrid}
                className={`p-1 rounded ${showGrid ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                title={showGrid ? 'Hide Grid' : 'Show Grid'}
              >
                {showGrid ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {layoutMode
              ? '🖱️ Drag tables to move • Click & drag sections to reposition • Press M on selected table for floor options • Grid snap: ' + (showGrid ? 'ON' : 'OFF')
              : 'Enable Layout Mode to edit layout • Select table + press M to move between floors'
            }
          </p>
        </div>

        {/* Enhanced Layout Canvas */}
        <div
          ref={layoutRef}
          className="relative h-96 bg-gray-50 overflow-hidden"
          style={{
            cursor: layoutMode ? (draggedTable ? 'grabbing' : 'grab') : 'default',
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            width: `${100 / zoom}%`,
            height: `${384 / zoom}px`
          }}
        >
          {/* Grid Background */}
          {showGrid && layoutMode && (
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%" className="absolute inset-0">
                <defs>
                  <pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
                    <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="#9CA3AF" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          )}

          {/* Environmental Background Styling */}
          <div className="absolute inset-0">
            {(() => {
              const currentFloor = floors.find(f => f.id === activeFloor);
              const isOutdoor = currentFloor?.type === 'outdoor';

              if (isOutdoor) {
                // Outdoor styling
                return (
                  <div className="w-full h-full relative">
                    {/* Grass/ground texture */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200 opacity-20"></div>
                    {/* Sunlight effect */}
                    <div className="absolute top-0 left-1/4 w-32 h-32 bg-yellow-200 rounded-full opacity-10 blur-xl"></div>
                    {/* Weather elements */}
                    <div className="absolute top-4 right-4 text-2xl opacity-20">☀️</div>
                    <div className="absolute bottom-4 left-4 text-xl opacity-15">🌳</div>
                  </div>
                );
              } else {
                // Indoor styling based on restaurant type
                const indoorStyles = {
                  'cafe': 'from-amber-50 to-orange-50',
                  'casual': 'from-blue-50 to-indigo-50',
                  'fine-dining': 'from-purple-50 to-pink-50',
                  'bar': 'from-red-50 to-orange-50',
                  'banquet': 'from-emerald-50 to-teal-50'
                };

                return (
                  <div className={`w-full h-full bg-gradient-to-br ${indoorStyles[restaurantType] || 'from-gray-50 to-gray-100'} opacity-30 relative`}>
                    {/* Indoor elements */}
                    <div className="absolute top-2 left-2 text-lg opacity-10">💡</div>
                    <div className="absolute top-2 right-2 text-lg opacity-10">💡</div>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm opacity-15">
                      {restaurantType === 'fine-dining' ? '🥂' :
                       restaurantType === 'bar' ? '🍺' :
                       restaurantType === 'cafe' ? '☕' :
                       restaurantType === 'banquet' ? '🏛️' : '🍽️'}
                    </div>
                  </div>
                );
              }
            })()}
          </div>

          {/* Section Boundaries (Visual Guides) - Only show when no sections exist */}
          {layoutMode && floors.find(f => f.id === activeFloor)?.sections.length === 0 && (
            <>
              {/* Main Dining Area */}
              <div className="absolute top-4 left-4 w-48 h-32 border-2 border-blue-200 border-dashed rounded-lg opacity-30">
                <div className="absolute -top-6 left-2 text-xs font-medium text-blue-600 bg-white px-2 py-1 rounded">
                  Main Dining
                </div>
              </div>

              {/* Bar Area */}
              <div className="absolute top-4 right-4 w-32 h-24 border-2 border-purple-200 border-dashed rounded-lg opacity-30">
                <div className="absolute -top-6 left-2 text-xs font-medium text-purple-600 bg-white px-2 py-1 rounded">
                  Bar
                </div>
              </div>

              {/* Patio Area */}
              <div className="absolute bottom-4 left-4 w-40 h-28 border-2 border-green-200 border-dashed rounded-lg opacity-30">
                <div className="absolute -top-6 left-2 text-xs font-medium text-green-600 bg-white px-2 py-1 rounded">
                  Patio
                </div>
              </div>
            </>
          )}

          {/* Interactive Section Rectangles */}
          {floors.find(f => f.id === activeFloor)?.sections.map(section => (
            <div
              key={section.id}
              className={`absolute border-2 border-dashed rounded-lg cursor-pointer transition-all group ${layoutMode ? 'hover:border-blue-500 cursor-move' : ''} ${section.color === 'blue' ? 'border-blue-300 bg-blue-50' : section.color === 'purple' ? 'border-purple-300 bg-purple-50' : section.color === 'green' ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50'}`}
              style={{
                left: section.x,
                top: section.y,
                width: section.width,
                height: section.height
              }}
              onMouseDown={(e) => layoutMode && startSectionDrag(e, section)}
              onDoubleClick={() => {
                const newName = prompt('Edit section name:', section.name);
                if (newName && newName.trim()) {
                  setFloors(floors.map(floor =>
                    floor.id === activeFloor
                      ? {
                          ...floor,
                          sections: floor.sections.map(s =>
                            s.id === section.id ? { ...s, name: newName.trim() } : s
                          )
                        }
                      : floor
                  ));
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                const action = confirm(`Delete section "${section.name}"?\n\nTables in this section will be moved to the first available section.`);
                if (action) {
                  const currentFloor = floors.find(f => f.id === activeFloor);
                  const otherSections = currentFloor.sections.filter(s => s.id !== section.id);
                  const targetSection = otherSections[0];

                  if (targetSection) {
                    // Move tables to target section
                    setFloors(floors.map(floor =>
                      floor.id === activeFloor
                        ? {
                            ...floor,
                            sections: otherSections,
                            tables: floor.tables.map(table =>
                              table.section === section.name ? { ...table, section: targetSection.name } : table
                            )
                          }
                        : floor
                    ));
                  } else {
                    // No other sections, just remove
                    setFloors(floors.map(floor =>
                      floor.id === activeFloor
                        ? {
                            ...floor,
                            sections: otherSections,
                            tables: floor.tables.filter(table => table.section !== section.name)
                          }
                        : floor
                    ));
                  }
                }
              }}
            >
              {/* Section Label */}
              <div className={`absolute -top-6 left-2 text-xs font-medium bg-white px-2 py-1 rounded shadow-sm ${layoutMode ? 'group-hover:bg-blue-50' : ''} ${section.color === 'blue' ? 'text-blue-600' : section.color === 'purple' ? 'text-purple-600' : section.color === 'green' ? 'text-green-600' : 'text-orange-600'}`}>
                {section.name}
              </div>

              {/* Resize Handles - Only show in layout mode */}
              {layoutMode && (
                <>
                  {/* Corner resize handles */}
                  <div
                    className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 cursor-nw-resize"
                    onMouseDown={(e) => startSectionResize(e, section, 'nw')}
                  ></div>
                  <div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 cursor-ne-resize"
                    onMouseDown={(e) => startSectionResize(e, section, 'ne')}
                  ></div>
                  <div
                    className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 cursor-sw-resize"
                    onMouseDown={(e) => startSectionResize(e, section, 'sw')}
                  ></div>
                  <div
                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 cursor-se-resize"
                    onMouseDown={(e) => startSectionResize(e, section, 'se')}
                  ></div>

                  {/* Edge resize handles */}
                  <div
                    className="absolute top-1/2 -left-1 w-2 h-6 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 cursor-w-resize transform -translate-y-1/2"
                    onMouseDown={(e) => startSectionResize(e, section, 'w')}
                  ></div>
                  <div
                    className="absolute top-1/2 -right-1 w-2 h-6 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 cursor-e-resize transform -translate-y-1/2"
                    onMouseDown={(e) => startSectionResize(e, section, 'e')}
                  ></div>
                  <div
                    className="absolute left-1/2 -top-1 w-6 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 cursor-n-resize transform -translate-x-1/2"
                    onMouseDown={(e) => startSectionResize(e, section, 'n')}
                  ></div>
                  <div
                    className="absolute left-1/2 -bottom-1 w-6 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 cursor-s-resize transform -translate-x-1/2"
                    onMouseDown={(e) => startSectionResize(e, section, 's')}
                  ></div>
                </>
              )}
            </div>
          ))}

          {/* Move Menu */}
          {showMoveMenu && selectedTable && (
            <div
              className="move-menu absolute bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-2"
              style={{
                left: moveMenuPosition.x,
                top: moveMenuPosition.y,
                transform: 'translate(-50%, -100%)'
              }}
            >
              <div className="text-xs font-medium text-gray-700 mb-2">Move to Floor:</div>
              {floors.filter(f => f.id !== activeFloor).map(floor => {
                const currentTableCount = floor.tables.length;
                const isAtCapacity = currentTableCount >= floor.maxTables;

                return (
                  <button
                    key={floor.id}
                    onClick={() => {
                      if (isAtCapacity) {
                        alert(`Floor "${floor.name}" is at capacity (${currentTableCount}/${floor.maxTables} tables)`);
                        return;
                      }
                      moveTableToFloor(selectedTable.id, floor.id);
                      setShowMoveMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${isAtCapacity ? 'text-red-500 cursor-not-allowed' : 'text-gray-700'}`}
                    disabled={isAtCapacity}
                  >
                    {floor.name} ({currentTableCount}/{floor.maxTables})
                    {isAtCapacity && <span className="ml-2 text-red-500">⚠️</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* Enhanced Tables - Floor Specific */}
          {tables.filter(table => (table.floor || 1) === activeFloor).map(table => {
            const tableSize = getTableSize(table.capacity);
            const isSelected = selectedTable?.id === table.id;
            const isHovered = hoveredTable?.id === table.id;
            const isDragging = draggedTable?.id === table.id;

            return (
              <div
                key={table.id}
                data-table-id={table.id}
                className={`absolute rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${getStatusColor(table.status)} ${isSelected ? 'border-4 border-blue-500 shadow-xl z-10' : 'border-2 hover:border-gray-400'} ${isDragging ? 'shadow-2xl z-20' : 'hover:shadow-lg'}`}
                style={{
                  left: table.position.x,
                  top: table.position.y,
                  width: tableSize,
                  height: tableSize,
                  cursor: layoutMode ? 'grab' : 'pointer',
                  transform: isDragging ? 'scale(1.1)' : 'scale(1)'
                }}
                onMouseDown={(e) => handleMouseDown(e, table)}
                onClick={() => !layoutMode && setSelectedTable(table)}
                onMouseEnter={() => setHoveredTable(table)}
                onMouseLeave={() => setHoveredTable(null)}
              >
                {/* Table Number */}
                <div className="text-lg font-bold text-gray-800 mb-1">
                  {table.number}
                </div>

                {/* Capacity Indicator */}
                <div className="flex items-center text-xs text-gray-600 mb-1">
                  <Users className="w-3 h-3 mr-1" />
                  {table.capacity}
                </div>

                {/* Section Badge */}
                <div className={`text-xs px-1 py-0.5 rounded font-medium ${getSectionColor(table.section)}`}>
                  {table.section.split(' ')[0]}
                </div>

                {/* Status Indicator */}
                <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-white ${table.status === 'available' ? 'bg-green-500' : table.status === 'occupied' ? 'bg-red-500' : table.status === 'reserved' ? 'bg-yellow-500' : 'bg-blue-500'}`} />

                {/* Minus Button - Only show in layout mode on hover */}
                {layoutMode && isHovered && !isDragging && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete Table ${table.number}?`)) {
                        removeTable(table.id);
                      }
                    }}
                    className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors z-40"
                    title="Delete table"
                  >
                    ×
                  </button>
                )}

                {/* Hover Tooltip */}
                {isHovered && !isDragging && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-30">
                    Table {table.number} • {table.occupiedSeats || 0}/{table.capacity} seats • {table.status}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Layout Instructions */}
        <div className="p-4 bg-blue-50 border-t border-blue-200">
          <div className="flex items-start space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
              <span>Occupied</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full border-2 border-white"></div>
              <span>Reserved</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
              <span>Cleaning</span>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Move className="w-4 h-4 text-gray-600" />
              <span>Drag to move</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Card Grid Layout */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Table Configuration</h2>
              <p className="text-sm text-gray-600 mt-1">
                {tables.filter(t => (t.floor || 1) === activeFloor).length || 0} tables • Professional card-based management
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Grid: <span className="font-semibold">
                  {Math.max(4, Math.ceil(Math.sqrt(tables.filter(t => (t.floor || 1) === activeFloor).length || 0)))} × {Math.max(4, Math.ceil(Math.sqrt(tables.filter(t => (t.floor || 1) === activeFloor).length || 0)))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Grid Container */}
        <div className="p-6">
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(auto-fit, minmax(280px, 1fr))`,
              minWidth: '280px'
            }}
          >
            {tables.filter(table => (table.floor || 1) === activeFloor).map(table => {
              const isSelected = selectedTable?.id === table.id;

              return (
                <div
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className={`relative bg-white border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1 ${isSelected ? 'border-blue-500 shadow-xl ring-4 ring-blue-100' : 'border-gray-200 hover:border-gray-300'} ${table.status === 'available' ? 'hover:border-emerald-300' : table.status === 'occupied' ? 'hover:border-red-300' : table.status === 'reserved' ? 'hover:border-amber-300' : 'hover:border-blue-300'}`}
                >
                  {/* Status Indicator */}
                  <div className="absolute top-4 right-4">
                    <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${table.status === 'available' ? 'bg-emerald-500' : table.status === 'occupied' ? 'bg-red-500' : table.status === 'reserved' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                  </div>

                  {/* Table Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {table.shape === 'round' ? '🔵' :
                         table.shape === 'square' ? '⬜' :
                         table.shape === 'oval' ? '🥚' :
                         table.shape === 'rectangular' ? '▬️' :
                         '📏'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Table {table.number}</h3>
                        <p className="text-sm text-gray-600 capitalize">{table.shape}</p>
                      </div>
                    </div>
                  </div>

                  {/* Table Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <select
                        value={table.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateTableStatus(table.id, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="available">🟢 Available</option>
                        <option value="occupied">🔴 Occupied</option>
                        <option value="reserved">🟡 Reserved</option>
                        <option value="cleaning">🔵 Cleaning</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Occupied Seats:</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newOccupiedSeats = Math.max(0, (table.occupiedSeats || 0) - 1);
                            updateOccupiedSeats(table.id, newOccupiedSeats);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors"
                          title="Remove 1 person"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={table.occupiedSeats || 0}
                          onChange={(e) => {
                            e.stopPropagation();
                            const newOccupiedSeats = Math.max(0, Math.min(table.capacity, parseInt(e.target.value) || 0));
                            updateOccupiedSeats(table.id, newOccupiedSeats);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-12 text-center text-sm border border-gray-300 rounded px-1 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                          max={table.capacity}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newOccupiedSeats = Math.min(table.capacity, (table.occupiedSeats || 0) + 1);
                            updateOccupiedSeats(table.id, newOccupiedSeats);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-green-600 transition-colors"
                          title="Add 1 person"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Seat Utilization Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Seat Utilization</span>
                        <span>
                          {(() => {
                            const occupied = table.occupiedSeats ?? 0;
                            const capacity = table.capacity ?? 1;
                            return `${occupied}/${capacity} seats`;
                          })()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            (() => {
                              const occupied = table.occupiedSeats ?? 0;
                              const capacity = table.capacity ?? 1;
                              const utilization = capacity > 0 ? (occupied / capacity) : 0;

                              if (utilization >= 0.9) return 'bg-red-500';
                              if (utilization >= 0.7) return 'bg-yellow-500';
                              return 'bg-green-500';
                            })()
                          }`}
                          style={{
                            width: (() => {
                              const occupied = table.occupiedSeats ?? 0;
                              const capacity = table.capacity ?? 1;
                              const utilization = capacity > 0 ? (occupied / capacity) : 0;
                              return `${Math.min(utilization * 100, 100)}%`;
                            })()
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Capacity:</span>
                      <select
                        value={table.capacity}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateTable(table.id, { capacity: parseInt(e.target.value) });
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {[2, 4, 6, 8, 10, 12].map(cap => (
                          <option key={cap} value={cap}>{cap} seats</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Section:</span>
                      <select
                        value={table.section}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateTable(table.id, { section: e.target.value });
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {floors.find(f => f.id === activeFloor)?.sections.map(section => (
                          <option key={section.id} value={section.name}>{section.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Shape:</span>
                      <select
                        value={table.shape || 'round'}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateTable(table.id, { shape: e.target.value });
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="round">Round</option>
                        <option value="square">Square</option>
                        <option value="oval">Oval</option>
                        <option value="rectangular">Rectangular</option>
                        <option value="high-top">High Top</option>
                      </select>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${table.status === 'available' ? 'bg-emerald-100 text-emerald-800' : table.status === 'occupied' ? 'bg-red-100 text-red-800' : table.status === 'reserved' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                        {table.status === 'available' ? '🟢' :
                         table.status === 'occupied' ? '🔴' :
                         table.status === 'reserved' ? '🟡' :
                         '🔵'} {table.status}
                      </span>
                      {table.occupiedSeats > 0 && (
                        <span className="text-xs text-gray-500 mt-1">
                          {table.occupiedSeats}/{table.capacity} seats occupied
                        </span>
                      )}
                      {table.availableSeats !== undefined && table.availableSeats !== table.capacity && (
                        <span className="text-xs text-blue-600">
                          {table.availableSeats} seats available
                        </span>
                      )}
                    </div>

                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTable(table);
                          const rect = layoutRef.current?.getBoundingClientRect();
                          if (rect) {
                            setMoveMenuPosition({
                              x: rect.left + table.position.x + 40,
                              y: rect.top + table.position.y
                            });
                            setShowMoveMenu(true);
                          }
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                        title="Move to another floor"
                      >
                        <Move className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete Table ${table.number}?`)) {
                            removeTable(table.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                        title="Delete table"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute inset-0 border-2 border-blue-500 rounded-xl pointer-events-none"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {(tables.filter(t => (t.floor || 1) === activeFloor).length === 0) && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Tables Yet</h3>
              <p className="text-gray-600 mb-4">Add your first table to get started with the card-based management system.</p>
              <button
                onClick={() => setShowAddTable(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Table
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Professional Add Section Modal */}
      {showAddSection && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <PlusCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Add New Section</h3>
                  <p className="text-sm text-gray-600">Create a new dining section for your restaurant</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddSection(false);
                  setNewSectionName('');
                }}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Section Name
                </label>
                <input
                  type="text"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter section name (e.g., Main Dining, Bar Area, VIP Section)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addSection();
                    }
                  }}
                />
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600">
                  <div className="font-medium mb-2">💡 How to use sections:</div>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Use descriptive names like "Main Dining", "Bar Area", "VIP Section"</li>
                    <li>Sections help organize tables and track seating</li>
                    <li>Each floor can have unlimited sections</li>
                    <li>Tables can be assigned to specific sections</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => {
                  setShowAddSection(false);
                  setNewSectionName('');
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={addSection}
                disabled={!newSectionName.trim()}
                className={`px-6 py-3 bg-gradient-to-r text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg ${
                  newSectionName.trim()
                    ? 'bg-green-600 hover:bg-green-700 from-green-600 to-green-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <PlusCircle className="w-4 h-4 mr-2 inline" />
                Add Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Professional Add Table Modal */}
      {showAddTable && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Add New Table</h3>
                  <p className="text-sm text-gray-600">Create a new table for your restaurant</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddTable(false)}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Table Number
                </label>
                <input
                  type="number"
                  value={newTable.number}
                  onChange={(e) => setNewTable({...newTable, number: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter table number"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Seating Capacity
                </label>
                <select
                  value={newTable.capacity}
                  onChange={(e) => setNewTable({...newTable, capacity: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value={2}>👥 2 seats</option>
                  <option value={4}>👨‍👩‍👧‍👦 4 seats</option>
                  <option value={6}>👨‍👩‍👧‍👦 6 seats</option>
                  <option value={8}>👨‍👩‍👧‍👦 8 seats</option>
                  <option value={10}>👨‍👩‍👧‍👦 10 seats</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Table Shape
                </label>
                <select
                  value={newTable.shape}
                  onChange={(e) => setNewTable({...newTable, shape: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="round">🔵 Round</option>
                  <option value="square">⬜ Square</option>
                  <option value="oval">🥚 Oval</option>
                  <option value="rectangular">▬️ Rectangular</option>
                  <option value="high-top">📏 High Top</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Section
                </label>
                <select
                  value={newTable.section}
                  onChange={(e) => setNewTable({...newTable, section: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {floors.find(f => f.id === activeFloor)?.sections.map(section => (
                    <option key={section.id} value={section.name}>{section.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => setShowAddTable(false)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={addTable}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2 inline" />
                Add Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Table Details */}
      {selectedTable && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Table #{selectedTable.number} Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <span className={`px-2 py-1 rounded text-sm ${getSectionColor(selectedTable.status)}`}>
                {selectedTable.status}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Occupied Seats</label>
              <span className="text-sm text-gray-900">{selectedTable.occupiedSeats || 0} seats</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Capacity</label>
              <span className="text-sm text-gray-900">{selectedTable.capacity} seats</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Available Seats</label>
              <span className="text-sm text-gray-900">{selectedTable.capacity - (selectedTable.occupiedSeats || 0)} seats</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Section</label>
              <span className={`px-2 py-1 rounded text-xs ${getSectionColor(selectedTable.section)}`}>
                {selectedTable.section}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManagement;
