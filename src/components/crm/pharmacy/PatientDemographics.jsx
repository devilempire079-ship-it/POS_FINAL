import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Heart,
  Users
} from 'lucide-react';

const PatientDemographics = ({ customer, onDemographicsUpdated }) => {
  const [demographics, setDemographics] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    phoneNumbers: [
      { type: 'home', number: '' },
      { type: 'mobile', number: '' }
    ],
    email: '',
    emergencyContacts: [
      { name: '', relationship: '', phone: '' }
    ],
    preferredLanguage: 'English',
    ethnicity: '',
    occupation: '',
    maritalStatus: '',
    patientType: 'regular',
    registrationDate: new Date().toISOString().split('T')[0],
    lastUpdated: new Date().toISOString()
  });

  const [editing, setEditing] = useState(false);
  const [tempDemographics, setTempDemographics] = useState({});
  const [loading, setLoading] = useState(true);

  // Load patient demographics
  useEffect(() => {
    if (customer?.id) {
      // Mock loading from API
      const mockDemographics = {
        firstName: customer.name?.split(' ')[0] || '',
        lastName: customer.name?.split(' ').slice(1).join(' ') || '',
        dateOfBirth: '1975-03-15',
        gender: 'Female',
        address: {
          street: '123 Oak Street',
          city: 'Anytown',
          state: 'CA',
          zipCode: '90210'
        },
        phoneNumbers: [
          { type: 'home', number: '+1-555-0100' },
          { type: 'mobile', number: '+1-555-0101' }
        ],
        email: customer.email,
        emergencyContacts: [
          { name: 'John Smith', relationship: 'Spouse', phone: '+1-555-0102' },
          { name: 'Alice Johnson', relationship: 'Daughter', phone: '+1-555-0103' }
        ],
        preferredLanguage: 'English',
        ethnicity: 'Caucasian',
        occupation: 'Teacher',
        maritalStatus: 'Married',
        patientType: 'regular',
        registrationDate: '2020-01-15',
        lastUpdated: new Date().toISOString()
      };

      setDemographics(mockDemographics);
      setTempDemographics(mockDemographics);
      setLoading(false);
    }
  }, [customer]);

  const saveDemographics = async () => {
    try {
      // Validate required fields
      if (!tempDemographics.firstName || !tempDemographics.lastName || !tempDemographics.dateOfBirth) {
        alert('Please fill in required fields (First Name, Last Name, Date of Birth)');
        return;
      }

      // API call would go here
      setDemographics({ ...tempDemographics, lastUpdated: new Date().toISOString() });
      setEditing(false);

      if (onDemographicsUpdated) {
        onDemographicsUpdated(tempDemographics);
      }
    } catch (error) {
      console.error('Failed to save demographics:', error);
    }
  };

  const cancelEdit = () => {
    setTempDemographics(demographics);
    setEditing(false);
  };

  const updatePhoneNumber = (index, field, value) => {
    const updated = [...tempDemographics.phoneNumbers];
    updated[index] = { ...updated[index], [field]: value };
    setTempDemographics({ ...tempDemographics, phoneNumbers: updated });
  };

  const updateEmergencyContact = (index, field, value) => {
    const updated = [...tempDemographics.emergencyContacts];
    updated[index] = { ...updated[index], [field]: value };
    setTempDemographics({ ...tempDemographics, emergencyContacts: updated });
  };

  const addEmergencyContact = () => {
    setTempDemographics({
      ...tempDemographics,
      emergencyContacts: [
        ...tempDemographics.emergencyContacts,
        { name: '', relationship: '', phone: '' }
      ]
    });
  };

  const removeEmergencyContact = (index) => {
    setTempDemographics({
      ...tempDemographics,
      emergencyContacts: tempDemographics.emergencyContacts.filter((_, i) => i !== index)
    });
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getPatientTypeColor = (type) => {
    switch (type) {
      case 'highRisk': return 'bg-red-100 text-red-800';
      case 'vip': return 'bg-yellow-100 text-yellow-800';
      case 'frequent': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="patient-demographics space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Patient Demographics
          </h3>
          <p className="text-sm text-gray-600 mt-1">Complete patient registration and demographic information</p>
        </div>

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Demographics</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={saveDemographics}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
            <button
              onClick={cancelEdit}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2 text-blue-600" />
          Basic Information
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              First Name <span className="text-red-500">*</span>
            </label>
            {editing ? (
              <input
                type="text"
                value={tempDemographics.firstName || ''}
                onChange={(e) => setTempDemographics({ ...tempDemographics, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            ) : (
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{demographics.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              Last Name <span className="text-red-500">*</span>
            </label>
            {editing ? (
              <input
                type="text"
                value={tempDemographics.lastName || ''}
                onChange={(e) => setTempDemographics({ ...tempDemographics, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            ) : (
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{demographics.lastName}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            {editing ? (
              <input
                type="date"
                value={tempDemographics.dateOfBirth || ''}
                onChange={(e) => setTempDemographics({ ...tempDemographics, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            ) : (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-900">{demographics.dateOfBirth}</span>
                <span className="text-xs text-blue-600 font-medium">
                  {calculateAge(demographics.dateOfBirth)} years old
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">Gender</label>
            {editing ? (
              <select
                value={tempDemographics.gender || ''}
                onChange={(e) => setTempDemographics({ ...tempDemographics, gender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            ) : (
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{demographics.gender}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">Patient Type</label>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPatientTypeColor(demographics.patientType)}`}>
              {demographics.patientType === 'vip' ? 'VIP Patient' :
               demographics.patientType === 'highRisk' ? 'High Risk' :
               demographics.patientType === 'frequent' ? 'Frequent User' : 'Regular Patient'}
            </span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">Registration Date</label>
            <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{demographics.registrationDate}</p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <Phone className="h-5 w-5 mr-2 text-green-600" />
          Contact Information
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phone Numbers */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Phone Numbers</h5>
            <div className="space-y-2">
              {tempDemographics.phoneNumbers?.map((phone, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="w-12 text-xs text-gray-500 capitalize">{phone.type}:</span>
                  {editing ? (
                    <input
                      type="tel"
                      value={phone.number}
                      onChange={(e) => updatePhoneNumber(index, 'number', e.target.value)}
                      placeholder={`${phone.type} phone`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <span className="flex-1 text-sm text-gray-900">{phone.number || 'Not provided'}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Email */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Email Address</h5>
            {editing ? (
              <input
                type="email"
                value={tempDemographics.email || ''}
                onChange={(e) => setTempDemographics({ ...tempDemographics, email: e.target.value })}
                placeholder="patient@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                <Mail className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-900">{demographics.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="mt-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            Address
          </h5>
          {editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                value={tempDemographics.address?.street || ''}
                onChange={(e) => setTempDemographics({
                  ...tempDemographics,
                  address: { ...tempDemographics.address, street: e.target.value }
                })}
                placeholder="Street Address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                value={tempDemographics.address?.city || ''}
                onChange={(e) => setTempDemographics({
                  ...tempDemographics,
                  address: { ...tempDemographics.address, city: e.target.value }
                })}
                placeholder="City"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                value={tempDemographics.address?.state || ''}
                onChange={(e) => setTempDemographics({
                  ...tempDemographics,
                  address: { ...tempDemographics.address, state: e.target.value }
                })}
                placeholder="State"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                value={tempDemographics.address?.zipCode || ''}
                onChange={(e) => setTempDemographics({
                  ...tempDemographics,
                  address: { ...tempDemographics.address, zipCode: e.target.value }
                })}
                placeholder="ZIP Code"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded text-sm text-gray-900">
              {demographics.address?.street && `${demographics.address.street}, `}
              {demographics.address?.city && `${demographics.address.city}, `}
              {demographics.address?.state && `${demographics.address.state} `}
              {demographics.address?.zipCode}
            </div>
          )}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-red-600" />
          Emergency Contacts
        </h4>

        <div className="space-y-3">
          {tempDemographics.emergencyContacts?.map((contact, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700">Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
                      placeholder="Contact name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{contact.name || 'Not provided'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700">Relationship</label>
                  {editing ? (
                    <select
                      value={contact.relationship}
                      onChange={(e) => updateEmergencyContact(index, 'relationship', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Relationship</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Child">Child</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Friend">Friend</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="text-sm text-gray-900">{contact.relationship || 'Not specified'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700">Phone</label>
                  <div className="flex items-center space-x-2">
                    {editing ? (
                      <>
                        <input
                          type="tel"
                          value={contact.phone}
                          onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)}
                          placeholder="Phone number"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                        {index > 0 && (
                          <button
                            onClick={() => removeEmergencyContact(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="flex-1 text-sm text-gray-900">{contact.phone || 'Not provided'}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {editing && tempDemographics.emergencyContacts?.length < 3 && (
            <button
              onClick={addEmergencyContact}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
            >
              + Add Emergency Contact
            </button>
          )}
        </div>
      </div>

      {/* Additional Demographics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <Heart className="h-5 w-5 mr-2 text-purple-600" />
          Additional Information
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">Preferred Language</label>
            {editing ? (
              <select
                value={tempDemographics.preferredLanguage || 'English'}
                onChange={(e) => setTempDemographics({ ...tempDemographics, preferredLanguage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="Chinese">Chinese</option>
                <option value="Vietnamese">Vietnamese</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{demographics.preferredLanguage}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">Ethnicity</label>
            {editing ? (
              <select
                value={tempDemographics.ethnicity || ''}
                onChange={(e) => setTempDemographics({ ...tempDemographics, ethnicity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Ethnicity</option>
                <option value="Caucasian">Caucasian</option>
                <option value="African American">African American</option>
                <option value="Hispanic">Hispanic</option>
                <option value="Asian">Asian</option>
                <option value="Native American">Native American</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{demographics.ethnicity || 'Not specified'}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">Occupation</label>
            {editing ? (
              <input
                type="text"
                value={tempDemographics.occupation || ''}
                onChange={(e) => setTempDemographics({ ...tempDemographics, occupation: e.target.value })}
                placeholder="Patient's occupation"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{demographics.occupation || 'Not specified'}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">Marital Status</label>
            {editing ? (
              <select
                value={tempDemographics.maritalStatus || ''}
                onChange={(e) => setTempDemographics({ ...tempDemographics, maritalStatus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{demographics.maritalStatus || 'Not specified'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDemographics;
