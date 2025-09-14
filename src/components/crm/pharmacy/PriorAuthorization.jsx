import React, { useState, useEffect } from 'react';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Phone,
  Mail,
  Plus,
  Send,
  Calendar,
  DollarSign,
  Pill,
  Shield,
  User
} from 'lucide-react';

const PriorAuthorization = ({ customer, selectedMedication }) => {
  const [authorizations, setAuthorizations] = useState([]);
  const [selectedAuth, setSelectedAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock prior authorization data
  useEffect(() => {
    if (customer?.id) {
      const mockAuthorizations = [
        {
          id: 1,
          medication: 'Humira (Adalimumab)',
          dosage: '40mg/0.8mL',
          condition: 'Rheumatoid Arthritis',
          submittedDate: '2025-08-15',
          status: 'approved',
          approvalNumber: 'PA2025-001234',
          insurance: 'Blue Cross Blue Shield',
          approver: 'Dr. Elizabeth Chen',
          approvedDate: '2025-08-20',
          effectiveDate: '2025-08-20',
          expirationDate: '2026-08-20',
          criteriaMet: ['Diagnosis confirmed', 'Alternative therapies failed', 'Clinical improvement expected'],
          notes: 'Approved for 4 weeks supply every 2 weeks as directed by rheumatology'
        },
        {
          id: 2,
          medication: 'Crestor (Rosuvastatin)',
          dosage: '20mg',
          condition: 'High Cholesterol',
          submittedDate: '2025-09-01',
          status: 'pending',
          insurance: 'Medicare Part D',
          submittedBy: 'Local Pharmacy',
          expectedApproval: '2025-09-15',
          criteriaUnderReview: ['LDL > 190 mg/dL', 'Cardiovascular risk assessment', 'Therapeutic response to statins'],
          followUpRequired: true,
          notes: 'Additional lab results requested for LDL ratio review'
        },
        {
          id: 3,
          medication: 'ProAir HFA (Albuterol)',
          dosage: '90mcg/inhalation',
          condition: 'Asthma',
          submittedDate: '2025-08-25',
          status: 'denied',
          insurance: 'UnitedHealthcare',
          deniedReason: 'Not diagnosed with asthma',
          denialCode: 'D001',
          appealEligible: true,
          appealDeadline: '2025-10-25',
          alternativeMedication: 'Budesonide',
          notes: 'Primary care physician note required for diagnosis confirmation'
        },
        {
          id: 4,
          medication: 'Enbrel (Etanercept)',
          dosage: '50mg',
          condition: 'Psoriatic Arthritis',
          submittedDate: '2025-07-10',
          status: 'expired',
          approvalNumber: 'PA2025-000567',
          insurance: 'Aetna',
          approvedDate: '2025-07-15',
          expirationDate: '2025-09-10',
          renewalRequired: true,
          renewalWindow: '2025-08-20 - 2025-09-10',
          notes: 'Renewal submission due before September 10th'
        }
      ];

      setTimeout(() => {
        setAuthorizations(mockAuthorizations);
        setSelectedAuth(mockAuthorizations[0]);
        setLoading(false);
      }, 1000);
    }
  }, [customer]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'denied': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'expired': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 border-green-200';
      case 'pending': return 'bg-yellow-100 border-yellow-200';
      case 'denied': return 'bg-red-100 border-red-200';
      case 'expired': return 'bg-orange-100 border-orange-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'denied': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="prior-authorization space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            Prior Authorization Management
          </h3>
          <p className="text-sm text-gray-600 mt-1">Insurance approvals for restricted medications</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Request</span>
        </button>
      </div>

      {/* Authorization Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
          <div className="text-2xl font-bold text-green-800">
            {authorizations.filter(a => a.status === 'approved').length}
          </div>
          <div className="text-sm text-green-600">Approved</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <Clock className="h-8 w-8 text-yellow-600 mb-2" />
          <div className="text-2xl font-bold text-yellow-800">
            {authorizations.filter(a => a.status === 'pending').length}
          </div>
          <div className="text-sm text-yellow-600">Pending</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <XCircle className="h-8 w-8 text-red-600 mb-2" />
          <div className="text-2xl font-bold text-red-800">
            {authorizations.filter(a => a.status === 'denied').length}
          </div>
          <div className="text-sm text-red-600">Denied</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <AlertTriangle className="h-8 w-8 text-orange-600 mb-2" />
          <div className="text-2xl font-bold text-orange-800">
            {authorizations.filter(a => a.status === 'expired').length}
          </div>
          <div className="text-sm text-orange-600">Expired</div>
        </div>
      </div>

      {/* Recent Authorizations List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Recent Prior Authorizations</h4>
        <div className="space-y-3">
          {authorizations.slice(0, 4).map((auth) => (
            <div
              key={auth.id}
              onClick={() => setSelectedAuth(auth)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedAuth?.id === auth.id ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(auth.status)}
                  <div>
                    <h5 className="font-semibold text-gray-900">{auth.medication}</h5>
                    <p className="text-sm text-gray-600">{auth.dosage} • {auth.condition}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(auth.status)}`}>
                  {auth.status.charAt(0).toUpperCase() + auth.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <FileText className="h-4 w-4 mr-1" />
                  Submitted: {new Date(auth.submittedDate).toLocaleDateString()}
                </div>
                <div className="flex items-center text-gray-600">
                  <Shield className="h-4 w-4 mr-1" />
                  {auth.insurance}
                </div>
                {auth.status === 'approved' && auth.approvalNumber && (
                  <div className="flex items-center text-green-600 font-medium">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {auth.approvalNumber}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Authorization View */}
      {selectedAuth && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              {getStatusIcon(selectedAuth.status)}
              <span className="ml-2">{selectedAuth.medication} Authorization</span>
            </h4>
            <span className={`px-4 py-2 rounded-lg text-sm font-medium ${getStatusBadge(selectedAuth.status)}`}>
              {selectedAuth.status.charAt(0).toUpperCase() + selectedAuth.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Medication & Condition</h5>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">{selectedAuth.medication}</p>
                  <p className="text-sm text-gray-600">{selectedAuth.dosage}</p>
                  <p className="text-sm text-gray-600">{selectedAuth.condition}</p>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-2">Insurance Provider</h5>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">{selectedAuth.insurance}</p>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-2">Timeline</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Submitted:</span>
                    <span>{new Date(selectedAuth.submittedDate).toLocaleDateString()}</span>
                  </div>
                  {selectedAuth.approvedDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Approved:</span>
                      <span>{new Date(selectedAuth.approvedDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {selectedAuth.effectiveDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Effective:</span>
                      <span>{new Date(selectedAuth.effectiveDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {selectedAuth.expirationDate && (
                    <div className="flex justify-between text-red-600">
                      <span>Expires:</span>
                      <span>{new Date(selectedAuth.expirationDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {selectedAuth.approvalNumber && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Approval Details</h5>
                  <div className="bg-green-50 border border-green-200 p-3 rounded">
                    <p className="text-green-800 font-medium">PA Number: {selectedAuth.approvalNumber}</p>
                    <p className="text-sm text-green-700">Approved by: {selectedAuth.approver}</p>
                  </div>
                </div>
              )}

              {selectedAuth.criteriaMet && selectedAuth.criteriaMet.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Approval Criteria Met</h5>
                  <div className="space-y-1">
                    {selectedAuth.criteriaMet.map((criteria, index) => (
                      <div key={index} className="flex items-center text-sm text-green-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {criteria}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedAuth.deniedReason && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Denial Reason</h5>
                  <div className="bg-red-50 border border-red-200 p-3 rounded">
                    <p className="text-red-800">{selectedAuth.deniedReason}</p>
                    <p className="text-sm text-red-700">Code: {selectedAuth.denialCode}</p>
                    {selectedAuth.appealDeadline && (
                      <p className="text-sm text-red-700">
                        Appeal by: {new Date(selectedAuth.appealDeadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {selectedAuth.alternativeMedication && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Suggested Alternative</h5>
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                    <p className="text-blue-800">{selectedAuth.alternativeMedication}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {selectedAuth.notes && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <h5 className="font-medium text-blue-900 mb-2">Additional Notes</h5>
              <p className="text-blue-800">{selectedAuth.notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            {selectedAuth.status === 'denied' && selectedAuth.appealEligible && (
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                File Appeal
              </button>
            )}
            {selectedAuth.status === 'approved' && selectedAuth.renewalRequired && (
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
                Submit Renewal
              </button>
            )}
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm">
              <FileText className="h-4 w-4 inline mr-1" />
              View Full PA
            </button>
          </div>
        </div>
      )}

      {/* Urgent Cases Alert */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
          <div>
            <h4 className="text-red-900 font-medium">Urgent Cases Requiring Immediate Attention</h4>
            <p className="text-red-700 text-sm mt-1">
              2 prior authorizations pending approval that may affect patient care.
              1 renewal expiring within 48 hours.
            </p>
            <button className="text-red-700 hover:text-red-800 text-sm font-medium mt-2">
              View Critical Cases →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriorAuthorization;
