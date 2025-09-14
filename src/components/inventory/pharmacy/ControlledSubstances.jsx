// Controlled Substances Management
// DEA compliance, Schedule tracking, witness signatures

const ControlledSubstances = () => {
  return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-bold text-red-800 mb-2">Controlled Substances Management</h3>
        <p className="text-red-700">DEA Schedule tracking with witness signatures and audit trails</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">23</div>
            <div className="text-sm text-gray-600">Schedule II</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">45</div>
            <div className="text-sm text-gray-600">Schedule III</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">67</div>
            <div className="text-sm text-gray-600">Schedule IV</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">12</div>
            <div className="text-sm text-gray-600">Schedule V</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">234</div>
            <div className="text-sm text-gray-600">DEA Form 222</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-xl font-bold mb-4">Controlled Substance Log</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Drug</th>
              <th className="text-left py-2">Schedule</th>
              <th className="text-left py-2">Quantity</th>
              <th className="text-left py-2">Witness</th>
              <th className="text-left py-2">Timestamp</th>
              <th className="text-left py-2">Form 222 #</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">Oxycodone 30mg</td>
              <td><span className="bg-red-100 px-2 py-1 rounded text-xs">C-II</span></td>
              <td>30 units</td>
              <td>Dr. Smith</td>
              <td>2025-01-15 14:30</td>
              <td>222-12345</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ControlledSubstances;
