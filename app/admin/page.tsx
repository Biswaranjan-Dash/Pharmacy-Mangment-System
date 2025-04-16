'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Pill as Pills, ShoppingCart, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

interface DashboardStats {
  totalUsers: number;
  totalMedicines: number;
  totalOrders: number;
  totalPrescriptions: number;
  monthlySales: { month: string; sales: number }[];
  medicineCategories: { name: string; value: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalMedicines: 0,
    totalOrders: 0,
    totalPrescriptions: 0,
    monthlySales: [],
    medicineCategories: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        console.log("Fetching with session:", session);
        const response = await fetch('/api/admin/stats', {
          credentials: 'include',
        });
        
        console.log("Response status:", response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("API error response:", errorData);
          throw new Error(errorData.error || `API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("API success response:", data);
        
        if (data && typeof data === 'object') {
          setStats({
            totalUsers: data.totalUsers || 0,
            totalMedicines: data.totalMedicines || 0,
            totalOrders: data.totalOrders || 0,
            totalPrescriptions: data.totalPrescriptions || 0,
            monthlySales: Array.isArray(data.monthlySales) ? data.monthlySales : [],
            medicineCategories: Array.isArray(data.medicineCategories) ? data.medicineCategories : [],
          });
        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
  
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      console.log("User authenticated as admin, fetching stats...");
      fetchStats();
    } else if (status === 'authenticated') {
      console.log("User authenticated but not admin:", session?.user?.role);
      setError('Unauthorized: Admin access required');
      setLoading(false);
    } else if (status === 'unauthenticated') {
      console.log("User not authenticated, redirecting to login...");
      signIn();
    }
  }, [status, session]);

  if (status === 'loading') {
    return <div className="p-8">Loading session...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  if (loading) {
    return <div className="p-8">Loading stats...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Medicines</CardTitle>
            <Pills className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMedicines}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrescriptions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px]">
              <BarChart
                width={500}
                height={300}
                data={stats.monthlySales}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8" name="Sales ($)" />
              </BarChart>
            </div>
          </CardContent>
        </Card>

        {/* Medicine Categories Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Medicine Categories Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px] flex justify-center">
              {stats.medicineCategories.length > 0 ? (
                <PieChart width={400} height={300}>
                  <Pie
                    data={stats.medicineCategories}
                    cx={200}
                    cy={150}
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.medicineCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              ) : (
                <div>No data available for medicine categories</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}