import React, { useState, useEffect } from 'react';
import {
  Heart,
  AlertTriangle,
  Pill,
  Stethoscope,
  User,
  Shield,
  Activity,
  Calendar,
  Clock,
  Save,
  Edit
} from 'lucide-react';
import api from '../../../services/api';

const ClinicalProfile = ({ customer, onProfileUpdated }) => {
  const [profile, setProfile] = useState({
    allergies: [],
    currentMedications: [],
    chronicConditions: [],
    pregnancyStatus: false,
    lactationStatus: false,
    smokingStatus: 'never',
    alcoholUse: 'none',
    heightCm: null,
    weightKg: null,
    bloodPressure: null,
    heartRate: null,
    preferredSubstitutions: true
  });

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({});

  useEffect(() => {
    if (customer?.id) {
      loadClinicalProfile();
    }
  }, [customer?.id]);

  const loadClinicalProfile = async () => {
    try {
      setLoading(true);
      // First try to load existing profile
      const { data } = await api.get(`/patients/${customer.id}/medical-profile`);

      if (data.profile) {
        const parsedProfile = {
          ...data.profile,
          allergies: data.profile.allergies ? JSON.parse(data.profile.allergies) : [],
          currentMedications: data.profile.currentMedications ? JSON.parse(data.profile.currentMedications) : [],
          chronicConditions: data.profile.chronicConditions ? JSON.parse(data.profile.chronicConditions) : [],
          consentSettings: data.profile.consentSettings ? JSON.parse(data.profile.consentSettings) : {}
        };
        setProfile(parsedProfile);
        setTempProfile(parsedProfile);
      }
    } catch (error) {
      console.warn('Clinical profile not found, showing empty form:', error.message);
      // Keep default empty profile state
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      const profileToSave = {
        ...tempProfile,
        allergies: JSON.stringify(tempProfile.allergies || []),
        currentMedications: JSON.stringify(tempProfile.currentMedications || []),
        chronicConditions: JSON.stringify(tempProfile.chronicConditions || [])
      };

      if (profile.id) {
        // Update existing
        await api.put(`/patients/${customer.id}/medical-profile`, profileToSave);
      } else {
        // Create new
        await api.post(`/patients/${customer.id}/medical-profile`, profileToSave);
      }

      setProfile(tempProfile);
      setEditing(false);

      if (onProfileUpdated) {
        onProfileUpdated(tempProfile);
      }

    } catch (error) {
      console.error('Failed to save clinical profile:', error);
    }
  };

  const cancelEdit = () => {
    setTempProfile(profile);
    setEditing(false);
  };

  const addAllergy = () => {
    setTempProfile(prev => ({
      ...prev,
      allergies: [...(prev.allergies || []), { substance: '', severity: 'mild', reaction: '' }]
    }));
  };

  const removeAllergy = (index) => {
    setTempProfile(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const updateAllergy = (index, field, value) => {
    setTempProfile(prev => ({
      ...prev,
      allergies: prev.allergies.map((allergy, i) =>
        i === index ? { ...allergy, [field]: value } : allergy
      )
    }));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'severe': return 'text-orange-600 bg-orange-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'mild': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Loading clinical profile...</span>
      </div>
    );
  }

  return (
    <div className="clinical-profile space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Stethoscope className="h-5 w-5 mr-2 text-green-600" />
            Clinical Profile
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Medical information and clinical preferences for {customer?.firstName}
          </p>
        </div>

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={saveProfile}
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

      {/* Allergies Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
          Allergies
        </h4>

        {editing ? (
          <div className="space-y-4">
            {(tempProfile.allergies || []).map((allergy, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-red-50 rounded-lg">
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Substance
                    </label>
                    <input
                      type="text"
                      value={allergy.substance}
                      onChange={(e) => updateAllergy(index, 'substance', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Penicillin"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Severity
                    </label>
                    <select
                      value={allergy.severity}
                      onChange={(e) => updateAllergy(index, 'severity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reaction
                    </label>
                    <input
                      type="text"
                      value={allergy.reaction}
                      onChange={(e) => updateAllergy(index, 'reaction', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Rash"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeAllergy(index)}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={addAllergy}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <span>+</span>
              <span>Add Allergy</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {(profile.allergies || []).length === 0 ? (
              <p className="text-gray-500 italic">No known allergies</p>
            ) : (
              (profile.allergies || []).map((allergy, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium text-gray-900">{allergy.substance}</p>
                      <p className="text-sm text-gray-600">Reaction: {allergy.reaction}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(allergy.severity)}`}>
                    {allergy.severity}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Health Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <Heart className="h-5 w-5 mr-2 text-red-500" />
          Health Status
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pregnancy Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Pregnancy Status</p>
            </div>
            {editing ? (
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempProfile.pregnancyStatus || false}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, pregnancyStatus: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            ) : (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${profile.pregnancyStatus ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {profile.pregnancyStatus ? 'Pregnant' : 'Not Pregnant'}
              </span>
            )}
          </div>

          {/* Lactation Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Lactation Status</p>
            </div>
            {editing ? (
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempProfile.lactationStatus || false}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, lactationStatus: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            ) : (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${profile.lactationStatus ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                {profile.lactationStatus ? 'Lactating' : 'Not Lactating'}
              </span>
            )}
          </div>

          {/* Smoking Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Smoking</p>
              <p className="text-xs text-gray-500">Status</p>
            </div>
            {editing ? (
              <select
                value={tempProfile.smokingStatus || 'never'}
                onChange={(e) => setTempProfile(prev => ({ ...prev, smokingStatus: e.target.value }))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="never">Never</option>
                <option value="former">Former</option>
                <option value="current">Current</option>
              </select>
            ) : (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                {profile.smokingStatus || 'never'}
              </span>
            )}
          </div>

          {/* Alcohol Use */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Alcohol</p>
              <p className="text-xs text-gray-500">Use</p>
            </div>
            {editing ? (
              <select
                value={tempProfile.alcoholUse || 'none'}
                onChange={(e) => setTempProfile(prev => ({ ...prev, alcoholUse: e.target.value }))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="none">None</option>
                <option value="occasional">Occasional</option>
                <option value="moderate">Moderate</option>
                <option value="heavy">Heavy</option>
              </select>
            ) : (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                {profile.alcoholUse || 'none'}
              </span>
            )}
          </div>
        </div>

        {/* Vital Signs */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <Activity className="h-4 w-4 mr-2 text-blue-500" />
            Vital Signs
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500">Height</p>
                {editing ? (
                  <input
                    type="number"
                    value={tempProfile.heightCm || ''}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, heightCm: e.target.value }))}
                    placeholder="cm"
                    className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                ) : (
                  <p className="text-sm font-medium">{profile.heightCm ? `${profile.heightCm} cm` : 'Not recorded'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-gray-500">Weight</p>
                {editing ? (
                  <input
                    type="number"
                    value={tempProfile.weightKg || ''}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, weightKg: e.target.value }))}
                    placeholder="kg"
                    className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                ) : (
                  <p className="text-sm font-medium">{profile.weightKg ? `${profile.weightKg} kg` : 'Not recorded'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-xs text-gray-500">Blood Pressure</p>
                {editing ? (
                  <input
                    type="text"
                    value={tempProfile.bloodPressure || ''}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, bloodPressure: e.target.value }))}
                    placeholder="120/80"
                    className="w-20 px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                ) : (
                  <p className="text-sm font-medium">{profile.bloodPressure || 'Not recorded'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-xs text-gray-500">Heart Rate</p>
                {editing ? (
                  <input
                    type="number"
                    value={tempProfile.heartRate || ''}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, heartRate: e.target.value }))}
                    placeholder="bpm"
                    className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                ) : (
                  <p className="text-sm font-medium">{profile.heartRate ? `${profile.heartRate} bpm` : 'Not recorded'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pharmacy Preferences */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2 text-blue-500" />
          Pharmacy Preferences
        </h4>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Preferred Generics</p>
              <p className="text-sm text-gray-600">Accept generic substitutes when available</p>
            </div>
            {editing ? (
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempProfile.preferredSubstitutions !== false}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, preferredSubstitutions: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            ) : (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${profile.preferredSubstitutions !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {profile.preferredSubstitutions !== false ? 'Yes' : 'No'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalProfile;
