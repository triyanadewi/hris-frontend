'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserClock, FaUserCheck, FaUserPlus, FaUserTimes } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Cookies from 'js-cookie';


// Warna untuk Pie Chart
const COLORS = ['#2E7D32', '#FF9800', '#EF4444'];

// Generate 6 bulan terakhir dari sekarang
const generateMonthOptions = () => {
  const options = [];
  const current = new Date();
  for (let i = 0; i < 6; i++) {
    const date = new Date(current.getFullYear(), current.getMonth() - i, 1);
    options.push(date.toLocaleString('default', { month: 'long', year: 'numeric' }));
  }
  return options;
};

const monthOptions = generateMonthOptions();

const dataBar = [
  { name: 'Now', value: 15 },
  { name: 'Active', value: 22 },
  { name: 'Resign', value: 12 },
];

const dataPie = [
  { name: 'On time', value: 289 },
  { name: 'Late', value: 89 },
  { name: 'Absent', value: 23 },
];

const statusData = [
  { label: 'Permanent', value: 33 },
  { label: 'Probation period', value: 67 },
  { label: 'Contract', value: 73 },
  { label: 'Internship', value: 50 },
];

const attendanceList = [
  { no: 1, name: 'Lamine Yamal', status: 'On time', time: '07:59' },
  { no: 2, name: 'Mbappe', status: 'Late', time: '08:03' },
  { no: 3, name: 'Mbappe', status: 'On time', time: '07:04' },
  { no: 4, name: 'Lamine Yamal', status: 'On time', time: '07:20' },
];

function AdminDashboardPage() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0]);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.replace('/signin');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);


  if (isAuthorized === null) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Total Employee" value="208" icon={<FaUserClock />} />
        <Card title="New Employees" value="20" icon={<FaUserPlus />} />
        <Card title="Active Employees" value="15" icon={<FaUserCheck />} />
        <Card title="Resigned Employees" value="10" icon={<FaUserTimes />} />
      </div>

      {/* Grafik Statistik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex justify-between items-center mb-10">
            <div>
              <p className="font-bold text-m text-gray-400">Employee Statistics</p>
              <h2 className="font-bold text-lg">Current Number of Employees</h2>
            </div>
            <Dropdown selected={selectedMonth} setSelected={setSelectedMonth} />
          </div>
          <BarChart width={600} height={300} data={dataBar}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#1C3D5A" radius={[6, 6, 0, 0]} />
          </BarChart>
        </div>

        {/* Employee Status */}
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex justify-between items-center mb-10">
            <div>
              <p className="font-bold text-m text-gray-400">Employee Statistics</p>
              <h2 className="font-bold text-lg">Employee Status</h2>
            </div>
            <Dropdown selected={selectedMonth} setSelected={setSelectedMonth} />
          </div>
          <div className="space-y-5">
            {statusData.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm font-medium">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="w-full bg-gray-200 h-3 rounded">
                  <div
                    className="h-3 bg-[#1C3D5A] rounded"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pie & Tabel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex justify-between items-start mb-10">
            <div>
              <p className="font-bold text-m text-gray-400">Statistics</p>
              <h2 className="font-bold text-lg">Attendance</h2>
            </div>
            <span className="font-bold text-sm">Today</span>
          </div>
          <PieChart width={850} height={300}>
            <Pie
              data={dataPie}
              cx="50%"
              cy="50%"
              outerRadius={125}
              label
              dataKey="value"
            >
              {dataPie.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
          <div className="mt-4 space-y-2 text-sm">
            <p><span className="inline-block w-3 h-3 rounded-full bg-[#2E7D32] mr-2"></span>On time: 289</p>
            <p><span className="inline-block w-3 h-3 rounded-full bg-[#FF9800] mr-2"></span>Late: 89</p>
            <p><span className="inline-block w-3 h-3 rounded-full bg-[#EF4444] mr-2"></span>Absent: 23</p>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex justify-between items-center mb-10">
            <h2 className="font-bold text-lg">Attendance</h2>
            <Dropdown selected={selectedMonth} setSelected={setSelectedMonth} />
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">No</th>
                <th>Name</th>
                <th>Attendance Status</th>
                <th>Check In</th>
              </tr>
            </thead>
            <tbody>
              {attendanceList.map((user) => (
                <tr key={user.no} className="border-b">
                  <td className="py-2">{user.no}</td>
                  <td>{user.name}</td>
                  <td>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium
                      ${user.status === 'On time' ? 'bg-green-100 text-green-800' :
                        user.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Komponen Kartu
function Card({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center text-center gap-1">
      <div className="text-blue-800 text-2xl">{icon}</div>
      <p className="text-sm text-gray-600">{title}</p>
      <h2 className="text-xl font-bold">{value}</h2>
      <p className="text-xs text-gray-400">Update: {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
    </div>
  );
}

// Komponen Dropdown Bulan
function Dropdown({ selected, setSelected }: { selected: string, setSelected: (val: string) => void }) {
  return (
    <select
      value={selected}
      onChange={(e) => setSelected(e.target.value)}
      className="text-sm bg-[#BA3C54] text-white rounded px-3 py-1"
    >
      {monthOptions.map((month) => (
        <option key={month} value={month}>{month}</option>
      ))}
    </select>
  );
}

// Export dinamis (hindari SSR)
export default dynamic(() => Promise.resolve(AdminDashboardPage), { ssr: false });
