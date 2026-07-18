export default function OwnerDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">แดชบอร์ดผู้ประกอบการ</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">สาขาของฉัน</div>
          <div className="text-2xl font-bold">--</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">นักเรียนทั้งหมด</div>
          <div className="text-2xl font-bold">--</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">รายได้เดือนนี้</div>
          <div className="text-2xl font-bold">--</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">คอร์สเรียน</div>
          <div className="text-2xl font-bold">--</div>
        </div>
      </div>
    </div>
  );
}
