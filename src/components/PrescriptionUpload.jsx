import React, { useState, useRef } from 'react';
import api from '../services/api';
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';

const PrescriptionUpload = ({
  onUploadSuccess,
  onValidationSuccess,
  customerId,
  pharmacistName,
  onClose
}) => {
  const [uploadStep, setUploadStep] = useState('upload'); // 'upload', 'processing', 'validation', 'success'
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [ocrData, setOcrData] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFileSelection(files[0]);
    }
  };

  // Handle file selection
  const handleFileSelection = async (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
    setError(null);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // Handle file upload to server
  const handleUpload = async () => {
    if (!uploadedFile || !customerId) return;

    setLoading(true);
    setUploadStep('processing');
    setError(null);

    try {
      // Convert file to base64
      const imageData = await fileToBase64(uploadedFile);

      // Upload prescription
      const uploadResponse = await api.request('/api/pharmacy/prescriptions/upload', {
        method: 'POST',
        body: JSON.stringify({
          prescriptionId: `RX-${Date.now()}`,
          customerId,
          imageData,
          imageName: uploadedFile.name,
          origSeqNum: null
        })
      });

      if (uploadResponse.success) {
        // Handle different API response structures safely
        const prescriptionId = uploadResponse.prescription?.prescriptionId ||
                              uploadResponse.prescription?.id ||
                              uploadResponse.prescriptionId ||
                              `RX-${Date.now()}`;

        await handleOCRAndValidation(imageData, prescriptionId);
      }

    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload prescription. Please try again.');
      setUploadStep('upload');
    }

    setLoading(false);
  };

  // Handle OCR and validation
  const handleOCRAndValidation = async (imageData, prescriptionId) => {
    try {
      const validationResponse = await api.request('/api/pharmacy/prescriptions/validate', {
        method: 'POST',
        body: JSON.stringify({
          prescriptionId,
          imageData
        })
      });

      if (validationResponse.success) {
        setOcrData(validationResponse.ocrData);
        setValidationResult(validationResponse.validation);

        if (validationResponse.validation.isValid) {
          setUploadStep('success');
          onUploadSuccess?.(validationResponse.ocrData);
          onValidationSuccess?.({
            prescriptionId,
            ocrData: validationResponse.ocrData,
            validation: validationResponse.validation
          });
        } else {
          setUploadStep('validation');
          // Handle both array and string error formats
          const errorMessage = Array.isArray(validationResponse.errors)
            ? validationResponse.errors.join(', ')
            : validationResponse.errors || 'Unknown validation error';
          setError(`Validation failed: ${errorMessage}`);
        }
      }

    } catch (error) {
      console.error('Validation error:', error);
      setError('Failed to process prescription. Please try again.');
      setUploadStep('upload');
    }
  };

  // Render different steps
  const renderUploadStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">Upload Prescription</h3>
        <p className="text-sm text-gray-600 mt-1">Upload a clear image of the prescription for verification</p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Prescription preview"
                className="max-w-full max-h-64 object-contain rounded-lg shadow-sm"
              />
              <button
                onClick={() => {
                  setUploadedFile(null);
                  setPreviewUrl(null);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-gray-500">
              {uploadedFile?.name} ({(uploadedFile?.size / 1024 / 1024).toFixed(2)}MB)
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-sm text-gray-600">
                Drag & drop a prescription image here, or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  browse files
                </button>
              </p>
              <p className="text-xs text-gray-500 mt-2">Supported formats: JPG, PNG, PDF (max 10MB)</p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelection(file);
          }}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={!uploadedFile || loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Upload & Process</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Prescription</h3>
      <div className="space-y-2 text-sm text-gray-600">
        <p>🔍 Extracting text from image...</p>
        <p>✅ Validating prescription format...</p>
        <p>🔒 Checking security requirements...</p>
      </div>
    </div>
  );

  const renderValidationStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-orange-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-gray-900">Validation Failed</h3>
        <p className="text-sm text-gray-600">Please review the issues below</p>
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="flex justify-center">
          <img
            src={previewUrl}
            alt="Prescription preview"
            className="max-w-full max-h-48 object-contain rounded-lg shadow-sm"
          />
        </div>
      )}

      {/* OCR Results */}
      {ocrData && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Extracted Information</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">Patient:</span> {ocrData.patientName || 'Not found'}</div>
            <div><span className="text-gray-500">Doctor:</span> {ocrData.doctorName || 'Not found'}</div>
            <div><span className="text-gray-500">Medication:</span> {ocrData.medicationName || 'Not found'}</div>
            <div><span className="text-gray-500">Dosage:</span> {ocrData.dosage || 'Not found'}</div>
            <div><span className="text-gray-500">Quantity:</span> {ocrData.quantity || 'Not found'}</div>
            <div><span className="text-gray-500">Refills:</span> {ocrData.refills || 'Not found'}</div>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationResult?.errors && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-900 mb-2">Validation Issues</h4>
          <ul className="text-sm text-red-800 space-y-1">
            {Array.isArray(validationResult.errors) ? (
              validationResult.errors.map((error, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <X className="w-3 h-3" />
                  <span>{error}</span>
                </li>
              ))
            ) : (
              <li className="flex items-center space-x-2">
                <X className="w-3 h-3" />
                <span>{typeof validationResult.errors === 'string' ? validationResult.errors : 'Validation failed'}</span>
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => setUploadStep('upload')}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Try Different Image
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-4">
      <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
      <h3 className="text-2xl font-semibold text-gray-900">Prescription Validated!</h3>
      <p className="text-gray-600">
        Prescription has been successfully uploaded and validated by {pharmacistName}
      </p>

      {/* Prescription Summary */}
      {ocrData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-left max-w-md mx-auto">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Patient:</span>
              <span className="font-medium">{ocrData.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Medication:</span>
              <span className="font-medium">{ocrData.medicationName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dosage:</span>
              <span className="font-medium">{ocrData.dosage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Quantity:</span>
              <span className="font-medium">{ocrData.quantity}</span>
            </div>
            {validationResult && (
              <div className="pt-2 border-t border-green-300">
                <div className="flex items-center justify-center space-x-2 text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">PHARMACIST VERIFIED</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-center space-x-3">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Continue to Checkout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Prescription Upload & Validation</span>
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          {uploadStep === 'upload' && renderUploadStep()}
          {uploadStep === 'processing' && renderProcessingStep()}
          {uploadStep === 'validation' && renderValidationStep()}
          {uploadStep === 'success' && renderSuccessStep()}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionUpload;
