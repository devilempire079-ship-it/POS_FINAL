import React, { useState, useEffect } from 'react';
import {
  History,
  Calendar,
  User,
  Heart,
  Pill,
  AlertTriangle,
  CheckCircle,
  Plus,
  Clock,
  Stethoscope,
  FileText,
  Activity
} from 'lucide-react';

const MedicalHistory = ({ customer }) => {
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock medical history data
  useEffect(() => {
    if (customer?.id) {
      const mockMedicalHistory = [
        // Past Medical History
        {
          id: 1,
          type: 'pastMedical',
          category: 'Past Medical History',
          title: 'Appendectomy',
          description: 'Laparoscopic appendectomy performed due to acute appendicitis',
          date: '2018-03-15',
          provider: 'General Hospital - Dr. Smith',
          medications: [],
          icon: '🏥',
          severity: 'resolved',
          icdCode: 'K35.89',
          notes: 'Uncomplicated recovery, no complications'
        },
        {
          id: 2,
          type: 'pastMedical',
          category: 'Past Medical History',
          title: 'Hypertension Diagnosis',
          description: 'Essential hypertension diagnosed during routine physical',
          date: '2020-06-10',
          provider: 'Family Practice - Dr. Johnson',
          medications: ['Lisinopril 10mg daily', 'Hydrochlorothiazide 25mg daily'],
          icon: '💔',
          severity: 'chronic',
          icdCode: 'I10',
          notes: 'Well controlled with medication, regular monitoring required'
        },

        // Surgeries
        {
          id: 3,
          type: 'surgery',
          category: 'Surgeries',
          title: 'Knee Arthroscopy',
          description: 'Partial medial meniscectomy and chondroplasty',
          date: '2022-11-08',
          provider: 'Orthopedic Center - Dr. Wilson',
          medications: ['Ibuprofen 400mg PRN', 'Physical therapy'],
          icon: '🦵',
          severity: 'resolved',
          icdCode: 'M23.219',
          notes: '3-month rehabilitation completed, full recovery'
        },

        // Immunizations
        {
          id: 4,
          type: 'immunization',
          category: 'Immunizations',
          title: 'COVID-19 Vaccine (Pfizer)',
          description: 'Primary series - Moderna mRNA-1273',
          date: '2021-03-15',
          provider: 'CVS Pharmacy',
          medications: [],
          icon: '💉',
          severity: 'preventive',
          icdCode: 'Z23',
          notes: 'Lot #FF1234, administered in left arm'
        },
        {
          id: 5,
          type: 'immunization',
          category: 'Immunizations',
          title: 'Annual Flu Vaccine',
          description: 'Quadrivalent inactivated influenza vaccine',
          date: '2024-10-02',
          provider: 'Local Pharmacy',
          medications: [],
          icon: '🦠',
          severity: 'preventive',
          icdCode: 'Z23',
          notes: 'High-dose formulation, no adverse reactions'
        },

        // Lab Results
        {
          id: 6,
          type: 'labResults',
          category: 'Lab Results',
          title: 'Comprehensive Metabolic Panel',
          description: 'Routine screening metabolic panel',
          date: '2025-08-20',
          provider: 'LabCorp',
          medications: [],
          icon: '🧪',
          severity: 'normal',
          icdCode: null,
          labResults: [
            { name: 'Glucose', value: '95 mg/dL', range: '70-100', status: 'normal' },
            { name: 'Creatinine', value: '0.9 mg/dL', range: '0.7-1.2', status: 'normal' },
            { name: 'eGFR', value: '105 mL/min', range: '>60', status: 'normal' },
            { name: 'Cholesterol Total', value: '185 mg/dL', range: '<200', status: 'normal' }
          ]
        },

        // Family History
        {
          id: 7,
          type: 'familyHistory',
          category: 'Family Medical History',
          title: 'Cardiovascular Disease - Father',
          description: 'Father had myocardial infarction at age 62, deceased',
          date: '2020-06-10',
          provider: 'Family Practice',
          medications: [],
          icon: '👨',
          severity: 'genetic',
          icdCode: 'Z82.49',
          notes: 'Increased risk for cardiovascular events'
        }
      ];

      setTimeout(() => {
        setMedicalHistory(mockMedicalHistory.sort((a, b) => new Date(b.date) - new Date(a.date)));
        setLoading(false);
      }, 1000);
    }
  }, [customer]);

  const categories = [
    { id: 'all', label: 'All History', count: medicalHistory.length },
    { id: 'pastMedical', label: 'Medical History', count: medicalHistory.filter(h => h.type === 'pastMedical').length },
    { id: 'surgery', label: 'Surgeries', count: medicalHistory.filter(h => h.type === 'surgery').length },
    { id: 'immunization', label: 'Immunizations', count: medicalHistory.filter(h => h.type === 'immunization').length },
    { id: 'labResults', label: 'Lab Results', count: medicalHistory.filter(h => h.type === 'labResults').length },
    { id: 'familyHistory', label: 'Family History', count: medicalHistory.filter(h => h.type === 'familyHistory').length }
  ];

  const filteredHistory = selectedCategory === 'all'
    ? medicalHistory
    : medicalHistory.filter(item => item.type === selectedCategory);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'severe': return 'text-orange-600 bg-orange-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'mild': return 'text-blue-600 bg-blue-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'chronic': return 'text-purple-600 bg-purple-50';
      case 'preventive': return 'text-teal-600 bg-teal-50';
      case 'genetic': return 'text-indigo-600 bg-indigo-50';
      case 'normal': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'pastMedical': return Heart;
      case 'surgery': return Stethoscope;
      case 'immunization': return Activity;
      case 'labResults': return FileText;
      case 'familyHistory': return User;
      default: return History;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="medical-history space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <History className="h-5 w-5 mr-2 text-blue-600" />
            Medical History Timeline
          </h3>
          <p className="text-sm text-gray-600 mt-1">Comprehensive chronological medical record</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Entry</span>
        </button>
      </div>

      {/* Category Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">No medical history found</p>
              <p className="text-sm">Medical history will appear here as it's recorded</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredHistory.map((item, index) => {
                const IconComponent = getCategoryIcon(item.type);
                return (
                  <div key={item.id} className="flex items-start space-x-4 relative">
                    {/* Timeline line */}
                    <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gray-200"></div>

                    {/* Timeline dot */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center relative z-10">
                      <span className="text-lg">{item.icon}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h4>
                          <p className="text-gray-600 mb-2">{item.description}</p>

                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(item.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {item.provider}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(item.severity)}`}>
                            {item.severity}
                          </span>
                          {item.icdCode && (
                            <span className="text-xs text-gray-500 font-mono">
                              {item.icdCode}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Medications */}
                      {item.medications && item.medications.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <Pill className="h-4 w-4 mr-1" />
                            Related Medications
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {item.medications.map((medication, idx) => (
                              <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                {medication}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Lab Results */}
                      {item.labResults && item.labResults.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            Lab Results
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {item.labResults.map((result, idx) => (
                              <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="text-sm font-medium">{result.name}</span>
                                <div className="text-right">
                                  <span className={`text-sm font-bold ${
                                    result.status === 'normal' ? 'text-green-600' :
                                    result.status === 'high' ? 'text-red-600' : 'text-orange-600'
                                  }`}>
                                    {result.value}
                                  </span>
                                  <div className="text-xs text-gray-500">{result.range}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {item.notes && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm text-gray-700">{item.notes}</p>
                        </div>
                      )}

                      {/* Category badge */}
                      <div className="mt-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <IconComponent className="h-3 w-3 mr-1" />
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl mb-1">🏥</div>
          <div className="text-lg font-semibold text-gray-900">
            {medicalHistory.filter(h => h.type === 'pastMedical').length}
          </div>
          <div className="text-xs text-gray-500">Medical Conditions</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl mb-1">💉</div>
          <div className="text-lg font-semibold text-gray-900">
            {medicalHistory.filter(h => h.type === 'immunization').length}
          </div>
          <div className="text-xs text-gray-500">Immunizations</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl mb-1">🧪</div>
          <div className="text-lg font-semibold text-gray-900">
            {medicalHistory.filter(h => h.type === 'labResults').length}
          </div>
          <div className="text-xs text-gray-500">Lab Results</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl mb-1">🦵</div>
          <div className="text-lg font-semibold text-gray-900">
            {medicalHistory.filter(h => h.type === 'surgery').length}
          </div>
          <div className="text-xs text-gray-500">Surgeries</div>
        </div>
      </div>
    </div>
  );
};

export default MedicalHistory;
