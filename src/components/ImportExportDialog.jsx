import React, { useState, useRef } from 'react';
import {
  ArrowDown,
  ArrowUp,
  FileText,
  FileSpreadsheet,
  X,
  Check,
  AlertTriangle,
  Loader,
  Info
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const ImportExportDialog = ({
  isOpen,
  onClose,
  onImport,
  onExport,
  type = 'products', // 'products', 'customers', 'sales'
  currentData = []
}) => {
  const [mode, setMode] = useState('import'); // 'import' or 'export'
  const [fileType, setFileType] = useState('csv'); // 'csv' or 'xlsx'
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState([]);
  const [successCount, setSuccessCount] = useState(0);
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef(null);

  // Define expected fields based on type
  const getExpectedFields = () => {
    switch (type) {
      case 'products':
        return [
          { key: 'name', label: 'Product Name', required: true },
          { key: 'sku', label: 'SKU', required: false },
          { key: 'barcode', label: 'Barcode', required: false },
          { key: 'description', label: 'Description', required: false },
          { key: 'price', label: 'Price', required: true },
          { key: 'costPrice', label: 'Cost Price', required: false },
          { key: 'stockQty', label: 'Stock Quantity', required: true },
          { key: 'minStockLevel', label: 'Min Stock Level', required: false },
          { key: 'maxStockLevel', label: 'Max Stock Level', required: false },
          { key: 'category', label: 'Category', required: false },
          { key: 'supplier', label: 'Supplier', required: false },
          { key: 'unit', label: 'Unit', required: false },
          { key: 'conversionRate', label: 'Conversion Rate', required: false },
          { key: 'isActive', label: 'Active', required: false }
        ];
      case 'customers':
        return [
          { key: 'firstName', label: 'First Name', required: true },
          { key: 'lastName', label: 'Last Name', required: true },
          { key: 'email', label: 'Email', required: false },
          { key: 'phone', label: 'Phone', required: false },
          { key: 'address', label: 'Address', required: false },
          { key: 'city', label: 'City', required: false },
          { key: 'state', label: 'State', required: false },
          { key: 'zipCode', label: 'ZIP Code', required: false },
          { key: 'dateOfBirth', label: 'Date of Birth', required: false },
          { key: 'loyaltyPoints', label: 'Loyalty Points', required: false }
        ];
      case 'sales':
        return [
          { key: 'date', label: 'Date', required: true },
          { key: 'customerName', label: 'Customer Name', required: false },
          { key: 'totalAmount', label: 'Total Amount', required: true },
          { key: 'paymentType', label: 'Payment Type', required: true },
          { key: 'items', label: 'Items (JSON)', required: false }
        ];
      default:
        return [];
    }
  };

  const expectedFields = getExpectedFields();

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setErrors([]);
    setSuccessCount(0);
    setProgress(0);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        let data = [];

        if (fileType === 'csv') {
          // Parse CSV
          Papa.parse(e.target.result, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              data = results.data;
              processData(data);
            },
            error: (error) => {
              setErrors(['Error parsing CSV file: ' + error.message]);
              setIsProcessing(false);
            }
          });
        } else {
          // Parse Excel
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          data = XLSX.utils.sheet_to_json(worksheet);
          processData(data);
        }
      } catch (error) {
        setErrors(['Error reading file: ' + error.message]);
        setIsProcessing(false);
      }
    };

    if (fileType === 'csv') {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  // Process the parsed data
  const processData = (data) => {
    if (data.length === 0) {
      setErrors(['No data found in file']);
      setIsProcessing(false);
      return;
    }

    // Show preview of first 5 rows
    setPreviewData(data.slice(0, 5));
    setShowPreview(true);

    // Validate data
    const validationErrors = [];
    let validCount = 0;

    data.forEach((row, index) => {
      const rowErrors = validateRow(row, index + 1);
      if (rowErrors.length > 0) {
        validationErrors.push(...rowErrors);
      } else {
        validCount++;
      }
    });

    setErrors(validationErrors);
    setSuccessCount(validCount);
    setIsProcessing(false);
  };

  // Validate a single row
  const validateRow = (row, rowNumber) => {
    const errors = [];

    expectedFields.forEach(field => {
      if (field.required && (!row[field.key] || row[field.key].toString().trim() === '')) {
        errors.push(`Row ${rowNumber}: Missing required field "${field.label}"`);
      }
    });

    // Type-specific validations
    if (type === 'products') {
      if (row.price && isNaN(parseFloat(row.price))) {
        errors.push(`Row ${rowNumber}: Invalid price format`);
      }
      if (row.stockQty && isNaN(parseInt(row.stockQty))) {
        errors.push(`Row ${rowNumber}: Invalid stock quantity`);
      }
    }

    return errors;
  };

  // Import the validated data
  const handleImport = async () => {
    if (errors.length > 0) {
      alert('Please fix validation errors before importing');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      await onImport(previewData, { type, fileType });

      clearInterval(progressInterval);
      setProgress(100);

      setTimeout(() => {
        onClose();
        // Reset state
        setMode('import');
        setFileType('csv');
        setErrors([]);
        setSuccessCount(0);
        setPreviewData([]);
        setShowPreview(false);
        setProgress(0);
      }, 1000);

    } catch (error) {
      setErrors(['Import failed: ' + error.message]);
      setIsProcessing(false);
    }
  };

  // Export data
  const handleExport = async () => {
    setIsProcessing(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 20, 90));
      }, 100);

      let exportData = [];

      if (type === 'products') {
        exportData = currentData.map(product => ({
          name: product.name,
          sku: product.sku,
          barcode: product.barcode,
          description: product.description,
          price: product.price,
          costPrice: product.costPrice,
          stockQty: product.stockQty,
          minStockLevel: product.minStockLevel,
          maxStockLevel: product.maxStockLevel,
          category: product.category?.name,
          supplier: product.supplier?.name,
          unit: product.unit,
          conversionRate: product.conversionRate,
          isActive: product.isActive
        }));
      }

      if (fileType === 'csv') {
        const csv = Papa.unparse(exportData);
        downloadFile(csv, `${type}.csv`, 'text/csv');
      } else {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, type);
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        downloadFile(excelBuffer, `${type}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      }

      clearInterval(progressInterval);
      setProgress(100);

      setTimeout(() => {
        onClose();
        setProgress(0);
      }, 1000);

    } catch (error) {
      setErrors(['Export failed: ' + error.message]);
      setIsProcessing(false);
    }
  };

  // Download file helper
  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Template download
  const downloadTemplate = () => {
    const templateData = expectedFields.map(field => ({
      [field.key]: field.required ? `Sample ${field.label}` : ''
    }));

    if (fileType === 'csv') {
      const csv = Papa.unparse(templateData);
      downloadFile(csv, `${type}_template.csv`, 'text/csv');
    } else {
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      downloadFile(excelBuffer, `${type}_template.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                {mode === 'import' ? <ArrowDown className="h-6 w-6 text-white" /> : <ArrowUp className="h-6 w-6 text-white" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {mode === 'import' ? 'Import' : 'Export'} {type.charAt(0).toUpperCase() + type.slice(1)}
                </h3>
                <p className="text-blue-100 text-sm">
                  {fileType.toUpperCase()} file operations
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Mode Selection */}
          <div className="mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setMode('import')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  mode === 'import'
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ArrowDown className="h-5 w-5" />
                <span>Import</span>
              </button>
              <button
                onClick={() => setMode('export')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  mode === 'export'
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ArrowUp className="h-5 w-5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* File Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              File Type
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setFileType('csv')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  fileType === 'csv'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className="h-6 w-6" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => setFileType('xlsx')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  fileType === 'xlsx'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileSpreadsheet className="h-6 w-6" />
                <span>Excel</span>
              </button>
            </div>
          </div>

          {mode === 'import' ? (
            <>
              {/* Import Section */}
              <div className="mb-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={fileType === 'csv' ? '.csv' : '.xlsx,.xls'}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="mb-4">
                    {fileType === 'csv' ? <FileText className="h-12 w-12 text-gray-400 mx-auto" /> : <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto" />}
                  </div>
                  <p className="text-gray-600 mb-4">
                    Click to select a {fileType.toUpperCase()} file or drag and drop
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors touch-manipulation"
                  >
                    Choose File
                  </button>
                </div>
              </div>

              {/* Template Download */}
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Info className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-800">Need a template?</p>
                        <p className="text-blue-700 text-sm">Download a sample file with the correct format</p>
                      </div>
                    </div>
                    <button
                      onClick={downloadTemplate}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors touch-manipulation"
                    >
                      Download Template
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              {showPreview && previewData.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Data Preview</h4>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr>
                          {Object.keys(previewData[0]).map(key => (
                            <th key={key} className="px-2 py-1 text-left font-medium text-gray-700">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value, cellIndex) => (
                              <td key={cellIndex} className="px-2 py-1 text-gray-600">
                                {String(value).length > 20 ? String(value).substring(0, 20) + '...' : String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Export Section */}
              <div className="mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <ArrowUp className="h-8 w-8 text-green-600" />
                    <div>
                      <h4 className="text-lg font-semibold text-green-800">Export {type.charAt(0).toUpperCase() + type.slice(1)}</h4>
                      <p className="text-green-700">Export {currentData.length} records to {fileType.toUpperCase()} file</p>
                    </div>
                  </div>
                  <div className="text-sm text-green-700">
                    <p className="mb-2">Fields to be exported:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {expectedFields.map(field => (
                        <span key={field.key} className="inline-flex items-center">
                          <Check className="h-4 w-4 mr-1" />
                          {field.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Progress and Status */}
          {isProcessing && (
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Loader className="h-5 w-5 text-blue-600 animate-spin" />
                  <span className="font-medium text-blue-800">
                    {mode === 'import' ? 'Processing import...' : 'Preparing export...'}
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-blue-700 text-sm mt-2">{progress}% complete</p>
              </div>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-800">Validation Errors</span>
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {errors.map((error, index) => (
                    <p key={index} className="text-red-700 text-sm mb-1">• {error}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Success Summary */}
          {successCount > 0 && (
            <div className="mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    {successCount} records ready for import
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors touch-manipulation"
            >
              Cancel
            </button>
            {mode === 'import' ? (
              <button
                onClick={handleImport}
                disabled={isProcessing || previewData.length === 0 || errors.length > 0}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors touch-manipulation flex items-center justify-center space-x-2"
              >
                <ArrowDown className="h-5 w-5" />
                <span>Import Data</span>
              </button>
            ) : (
              <button
                onClick={handleExport}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors touch-manipulation flex items-center justify-center space-x-2"
              >
                <ArrowUp className="h-5 w-5" />
                <span>Export Data</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportExportDialog;
