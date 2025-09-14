import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Shield,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search,
  Calendar,
  DollarSign,
  FileText
} from 'lucide-react';

const InsuranceManagement = ({ customer }) => {
  const [insuranceProfiles, setInsuranceProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock insurance data
  useEffect(() => {
    if (customer?.id) {
      const mockInsuranceData = [
        {
          id: 1,
          type: 'primary',
          provider: 'Blue Cross Blue Shield',
          planNumber: 'BCB123456789',
          groupNumber: 'GRP789012',
          subscriberId: 'SUB001234',
          relationship: 'self',
          effectiveDate: '2024-01-01',
          terminationDate: null,
          coverageLimits: '$5,000',
          copay: '$10',
          deductible: '$500',
          deductibleMet: '$250',
          status: 'active',
          eligibilityLastVerified: '2025-09-10',
          nextEligibilityCheck: '2025-09-10',
          priorAuthRequired: ['Specialty Drugs', 'High Cost Medications']
        },
        {
          id: 2,
          type: 'secondary',
          provider: 'Medicare Part D',
          planNumber: 'MDC987654321',
          groupNumber: 'MED123456',
          subscriberId: 'MCR456789',
          relationship: 'self',
          effectiveDate: '2024-01-01',
          terminationDate: null,
          coverageLimits: '$3,500',
          copay: '$0',
          deductible: '$0',
          deductibleMet: '$0',
          status: 'active',
          eligibilityLastVerified: '2025-09-08',
          nextEligibilityCheck: '2025-10-08'
        }
      ];

      setTimeout(() => {
        setInsuranceProfiles(mockInsuranceData);
        setSelectedProfile(mockInsuranceData[0]);
        setLoading(false);
      }, 800);
    }
  }, [customer]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProviderIcon = (provider) => {
    if (provider.toLowerCase().includes('medicare')) return '🏥';
    if (provider.toLowerCase().includes('blue')) return '🔷';
    return '🛡️';
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="insurance-management space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            Insurance Management
          </h3>
          <p className="text-sm text-gray-600 mt-1">Insurance coverage and eligibility verification</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Insurance</span>
        </button>
      </div>

      {/* Insurance Plans Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {insuranceProfiles.map((profile) => (
          <div
            key={profile.id}
            className={`bg-white rounded-lg border-2 p-6 cursor-pointer transition-all ${selectedProfile?.id === profile.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}`}
            onClick={() => setSelectedProfile(profile)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getProviderIcon(profile.provider)}</span>
                <div>
                  <h4 className="font-semibold text-gray-900">{profile.provider}</h4>
                  <p className="text-sm text-gray-600">{profile.type === 'primary' ? 'Primary' : 'Secondary'} Insurance</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(profile.status)}`}>
                {profile.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900">Plan:</span>
                <span className="text-gray-600 ml-1">{profile.planNumber}</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Group:</span>
                <span className="text-gray-600 ml-1">{profile.groupNumber}</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Copay:</span>
                <span className="text-gray-600 ml-1">{profile.copay}</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Deductible:</span>
                <span className="text-gray-600 ml-1">{profile.deductible} (${profile.deductibleMet} met)</span>
              </div>
            </div>

            {profile.priorAuthRequired && profile.priorAuthRequired.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-800">Prior Authorization Required</span>
                </div>
                <div className="mt-1 text-xs text-yellow-700">
                  {profile.priorAuthRequired.join(', ')}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Insurance Details */}
      {selectedProfile && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            {selectedProfile.provider} - {selectedProfile.type} Insurance
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h5 className="font-medium text-gray-900">Insurance Details</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan Number:</span>
                  <span className="font-mono font-medium">{selectedProfile.planNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Group Number:</span>
                  <span className="font-mono font-medium">{selectedProfile.groupNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subscriber ID:</span>
                  <span className="font-mono font-medium">{selectedProfile.subscriberId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Relationship:</span>
                  <span className="capitalize font-medium">{selectedProfile.relationship}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Coverage Limit:</span>
                  <span className="font-medium text-green-600">{selectedProfile.coverageLimits}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="font-medium text-gray-900">Billing Information</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Copay:</span>
                  <span className="font-medium">{selectedProfile.copay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deductible:</span>
                  <span className="font-medium">{selectedProfile.deductible}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Met:</span>
                  <span className="font-medium text-green-600">{selectedProfile.deductibleMet}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-medium text-orange-600">
                    ${parseFloat(selectedProfile.deductible.replace('$', '')) - parseFloat(selectedProfile.deductibleMet.replace('$', ''))}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="font-medium text-gray-900">Eligibility & Status</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProfile.status)}`}>
                    {selectedProfile.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Verified:</span>
                  <span className="font-medium">{new Date(selectedProfile.eligibilityLastVerified).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Check:</span>
                  <span className="font-medium">{new Date(selectedProfile.nextEligibilityCheck).toLocaleDateString()}</span>
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
                <Search className="h-4 w-4 inline mr-1" />
                Verify Eligibility
              </button>
            </div>
          </div>

          {selectedProfile.priorAuthRequired && selectedProfile.priorAuthRequired.length > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h5 className="font-medium text-yellow-900 mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Prior Authorization Requirements
              </h5>
              <div className="flex flex-wrap gap-2">
                {selectedProfile.priorAuthRequired.map((req, index) => (
                  <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    {req}
                  </span>
                ))}
              </div>
              <p className="text-sm text-yellow-700 mt-2">
                Contact insurance for prior authorization before dispensing these medications.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InsuranceManagement;
