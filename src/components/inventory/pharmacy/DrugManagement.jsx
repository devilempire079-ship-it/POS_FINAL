// Pharmacy Drug Management Component
// Custom form fields specific to pharmaceutical inventory
// Includes NDC, Manufacturer, DEA Schedule, and drug-specific fields

const DrugManagement = () => {
  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Drug Catalog Management</h3>

      {/* Pharmacy-Specific Drug Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h4 className="text-lg font-semibold mb-4">Add New Prescription Drug</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">NDC Code</label>
            <input
              type="text"
              placeholder="e.g., 0781-3244-01"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Drug Name</label>
            <input
              type="text"
              placeholder="e.g., Amoxicillin 500mg"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Generic Name</label>
            <input
              type="text"
              placeholder="e.g., Amoxicillin"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
            <input
              type="text"
              placeholder="e.g., Pfizer"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">DEA Schedule</label>
            <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
              <option value="">Not Controlled</option>
              <option value="I">Schedule I</option>
              <option value="II">Schedule II</option>
              <option value="III">Schedule III</option>
              <option value="IV">Schedule IV</option>
              <option value="V">Schedule V</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Lot Number</label>
            <input
              type="text"
              placeholder="e.g., LOT-2025-A"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Pharmacy-Specific Drug List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h4 className="text-lg font-semibold">Prescription Drug Catalog</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NDC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drug Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DEA Schedule</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lot #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">0781-3244-01</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Amoxicillin 500mg</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Pfizer</td>
                <td className="px-6 py-4 whitespace-nowrap"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Not Controlled</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">LOT-2025-A</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">0409-6028-01</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Lisinopril 10mg</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Lupin</td>
                <td className="px-6 py-4 whitespace-nowrap"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">C-II</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">LOT-2025-B</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-sm text-gray-600 mt-4">
        <strong>Custom Pharmacy Fields:</strong> NDC codes, DEA scheduling, manufacturer tracking, and controlled substance compliance are specific to pharmaceutical inventory management.
      </p>
    </div>
  );
};

export default DrugManagement;
