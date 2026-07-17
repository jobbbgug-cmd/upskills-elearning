export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Users</div>
          <div className="text-2xl font-bold">--</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Active Sessions</div>
          <div className="text-2xl font-bold">--</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Revenue Today</div>
          <div className="text-2xl font-bold">--</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Courses Active</div>
          <div className="text-2xl font-bold">--</div>
        </div>
      </div>
    </div>
  );
}
