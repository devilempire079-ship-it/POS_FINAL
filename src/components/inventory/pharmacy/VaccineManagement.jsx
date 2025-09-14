// Vaccine Management Component - Temperature-controlled vaccines with lot tracking

const VaccineManagement = () => {
  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Vaccine Inventory Management</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-bold text-blue-800">Temperature Monitor</h4>
          <div className="text-2xl font-bold text-blue-600">2-8°C</div>
          <div className="text-sm text-blue-700 mt-1">✓ Within Range</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-bold text-green-800">Vaccine Count</h4>
          <div className="text-2xl font-bold text-green-600">15</div>
          <div className="text-sm text-green-700 mt-1">Different Vaccines</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-bold text-orange-800">Expiring Soon</h4>
          <div className="text-2xl font-bold text-orange-600">2</div>
          <div className="text-sm text-orange-700 mt-1">Next 30 Days</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-semibold mb-4">Vaccine Inventory</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Vaccine</th>
              <th className="text-left py-2">Lot #</th>
              <th className="text-left py-2">Quantity</th>
              <th className="text-left py-2">Expiration</th>
              <th className="text-left py-2">Storage Temp</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">COVID-19 Vaccine</td>
              <td>VAX2025-001</td>
              <td>45 doses</td>
              <td>2025-12-15</td>
              <td>2-8°C</td>
            </tr>
            <tr className="border-b">
              <td className="py-2">Flu Vaccine</td>
              <td>FLU2025-A</td>
              <td>30 vials</td>
              <td>2025-11-20</td>
              <td>2-8°C</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-600 mt-4">
        <strong>Custom Vaccine Fields:</strong> Temperature monitoring, vaccine-specific lot tracking, and cold chain compliance are unique to pharmaceutical vaccine inventory.
      </p>
    </div>
  );
};

export default VaccineManagement;
