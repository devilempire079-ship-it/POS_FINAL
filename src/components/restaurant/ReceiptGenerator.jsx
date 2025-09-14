import React, { useState, useRef } from 'react';
import {
  Printer,
  Mail,
  Download,
  Receipt,
  CreditCard,
  DollarSign,
  Smartphone,
  Gift,
  Split,
  CheckCircle,
  X,
  FileText
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const ReceiptGenerator = ({
  order,
  onClose,
  onPrint,
  onEmail,
  onDownload
}) => {
  const [emailAddress, setEmailAddress] = useState('');
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const receiptRef = useRef(null);

  // Calculate totals
  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;
    const finalTotal = total + (order?.tip || 0);

    return { subtotal, tax, total, finalTotal };
  };

  const totals = calculateTotals(order?.items || []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle print
  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      // Create printable receipt content
      const printContent = generatePrintableReceipt();

      // Open print dialog
      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();

      // Call parent callback
      if (onPrint) {
        await onPrint(order);
      }
    } catch (error) {
      console.error('Print failed:', error);
      alert('Print failed. Please try again.');
    } finally {
      setIsPrinting(false);
    }
  };

  // Handle email
  const handleEmail = async () => {
    if (!emailAddress.trim()) {
      alert('Please enter an email address');
      return;
    }

    setIsEmailing(true);
    try {
      // Generate email content
      const emailContent = generateEmailContent();

      // Here you would integrate with email service
      // For now, we'll simulate sending
      console.log('Sending receipt to:', emailAddress);
      console.log('Email content:', emailContent);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert(`Receipt sent to ${emailAddress}`);

      if (onEmail) {
        await onEmail(order, emailAddress);
      }

      setShowEmailDialog(false);
      setEmailAddress('');
    } catch (error) {
      console.error('Email failed:', error);
      alert('Email failed. Please try again.');
    } finally {
      setIsEmailing(false);
    }
  };

  // Handle download
  const handleDownload = async () => {
    try {
      // Generate PDF content (simplified)
      const pdfContent = generatePDFContent();

      // Create blob and download
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${order.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (onDownload) {
        await onDownload(order);
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  // Generate printable receipt
  const generatePrintableReceipt = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Order #${order.id}</title>
        <style>
          body { font-family: 'Courier New', monospace; font-size: 12px; max-width: 300px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 20px; }
          .item { display: flex; justify-content: space-between; margin: 5px 0; }
          .total { border-top: 1px solid #000; margin-top: 10px; padding-top: 10px; }
          .bold { font-weight: bold; }
          .center { text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Essen Restaurant</h2>
          <p>123 Main Street<br>City, State 12345<br>(555) 123-4567</p>
        </div>

        <div class="item">
          <span>Order #:</span>
          <span>${order.id}</span>
        </div>
        <div class="item">
          <span>Table:</span>
          <span>${order.tableNumber}</span>
        </div>
        <div class="item">
          <span>Server:</span>
          <span>${order.server}</span>
        </div>
        <div class="item">
          <span>Date:</span>
          <span>${formatDate(order.createdAt)}</span>
        </div>

        <br>
        ${order.items.map(item => `
          <div class="item">
            <span>${item.quantity}x ${item.name}</span>
            <span>${formatCurrency(item.price * item.quantity)}</span>
          </div>
          ${item.notes ? `<div style="font-size: 10px; margin-left: 20px; color: #666;">${item.notes}</div>` : ''}
        `).join('')}

        <div class="total">
          <div class="item">
            <span>Subtotal:</span>
            <span>${formatCurrency(totals.subtotal)}</span>
          </div>
          <div class="item">
            <span>Tax (8%):</span>
            <span>${formatCurrency(totals.tax)}</span>
          </div>
          ${order.tip ? `
            <div class="item">
              <span>Tip:</span>
              <span>${formatCurrency(order.tip)}</span>
            </div>
          ` : ''}
          <div class="item bold">
            <span>Total:</span>
            <span>${formatCurrency(totals.finalTotal)}</span>
          </div>
        </div>

        <br>
        <div class="center">
          <p>Thank you for dining with us!</p>
          <p>Please come again soon.</p>
        </div>
      </body>
      </html>
    `;
  };

  // Generate email content
  const generateEmailContent = () => {
    const subject = `Receipt - Order #${order.id} - Essen Restaurant`;
    const body = `
Dear Valued Customer,

Thank you for dining at Essen Restaurant!

Order Details:
Order #: ${order.id}
Table: ${order.tableNumber}
Server: ${order.server}
Date: ${formatDate(order.createdAt)}

Items:
${order.items.map(item =>
  `${item.quantity}x ${item.name} - ${formatCurrency(item.price * item.quantity)}${item.notes ? `\n  Note: ${item.notes}` : ''}`
).join('\n')}

Subtotal: ${formatCurrency(totals.subtotal)}
Tax (8%): ${formatCurrency(totals.tax)}
${order.tip ? `Tip: ${formatCurrency(order.tip)}\n` : ''}Total: ${formatCurrency(totals.finalTotal)}

We hope you enjoyed your meal! Please join us again soon.

Best regards,
Essen Restaurant Team
    `;

    return { subject, body };
  };

  // Generate PDF content (simplified text version)
  const generatePDFContent = () => {
    return `
ESSEN RESTAURANT
123 Main Street
City, State 12345
(555) 123-4567

RECEIPT - Order #${order.id}

Date: ${formatDate(order.createdAt)}
Table: ${order.tableNumber}
Server: ${order.server}

${'-'.repeat(40)}

${order.items.map(item =>
  `${item.quantity}x ${item.name.padEnd(20)} ${formatCurrency(item.price * item.quantity).padStart(10)}`
).join('\n')}

${'-'.repeat(40)}

Subtotal: ${formatCurrency(totals.subtotal).padStart(30)}
Tax (8%): ${formatCurrency(totals.tax).padStart(30)}
${order.tip ? `Tip: ${formatCurrency(order.tip).padStart(30)}\n` : ''}Total: ${formatCurrency(totals.finalTotal).padStart(30)}

${'-'.repeat(40)}

Thank you for dining with us!
Please come again soon.
    `;
  };

  // Get payment method icon
  const getPaymentIcon = (method) => {
    switch (method) {
      case 'cash':
        return <DollarSign className="w-4 h-4" />;
      case 'credit':
      case 'debit':
        return <CreditCard className="w-4 h-4" />;
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'gift':
        return <Gift className="w-4 h-4" />;
      case 'split':
        return <Split className="w-4 h-4" />;
      default:
        return <Receipt className="w-4 h-4" />;
    }
  };

  if (!order) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No order selected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Receipt className="w-5 h-5 mr-2" />
              Receipt - Order #{order.id}
            </CardTitle>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Order Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Table:</span>
                <div className="font-semibold">{order.tableNumber}</div>
              </div>
              <div>
                <span className="text-gray-600">Server:</span>
                <div className="font-semibold">{order.server}</div>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Date:</span>
                <div className="font-semibold">{formatDate(order.createdAt)}</div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Order Items</h4>
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-start py-2 border-b border-gray-100">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {item.quantity}x {item.name}
                  </div>
                  {item.notes && (
                    <div className="text-sm text-gray-600 mt-1 italic">
                      {item.notes}
                    </div>
                  )}
                </div>
                <div className="font-semibold text-gray-900">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Payment Info */}
          {order.payments && order.payments.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Payment Details</h4>
              {order.payments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {getPaymentIcon(payment.method)}
                    <span className="capitalize font-medium text-green-800">
                      {payment.method}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-800">
                      {formatCurrency(payment.finalAmount)}
                    </div>
                    {payment.tip > 0 && (
                      <div className="text-sm text-green-600">
                        Tip: {formatCurrency(payment.tip)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (8%):</span>
              <span>{formatCurrency(totals.tax)}</span>
            </div>
            {order.tip && (
              <div className="flex justify-between text-sm">
                <span>Tip:</span>
                <span>{formatCurrency(order.tip)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t border-blue-200 pt-2">
              <span>Total:</span>
              <span>{formatCurrency(totals.finalTotal)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center justify-center"
            >
              <Printer className="w-4 h-4 mr-2" />
              {isPrinting ? 'Printing...' : 'Print'}
            </Button>

            <Button
              onClick={() => setShowEmailDialog(true)}
              variant="outline"
              className="flex items-center justify-center"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>

            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex items-center justify-center col-span-2"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Dialog */}
      {showEmailDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-sm w-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Email Receipt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowEmailDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEmail}
                  disabled={isEmailing || !emailAddress.trim()}
                  className="flex-1"
                >
                  {isEmailing ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default ReceiptGenerator;
