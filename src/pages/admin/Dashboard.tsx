import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingBag, DollarSign, TrendingUp, UserPlus, Package } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { adminAuth } from "@/lib/adminAuth";

const API_URL = import.meta.env.VITE_API_URL;

interface MongoAnalytics {
  users: {
    total: number;
    new: number;
  };
  tasks: {
    total: number;
    buy: number;
    sell: number;
    recent: number;
    byCategory: Array<{ category: string; count: number }>;
  };
  value: {
    totalTaskValue: number;
  };
}

interface MongoEarnings {
  totalTaskValue: number;
  estimatedCommission: number;
  commissionRate: number;
  netEarnings: number;
  productsByType: Array<{ type: string; count: number; totalValue: number; commission: number }>;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57'];

const Dashboard = () => {
  const [analytics, setAnalytics] = useState<MongoAnalytics | null>(null);
  const [earnings, setEarnings] = useState<MongoEarnings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMongoData();
  }, []);

  const fetchMongoData = async () => {
    try {
      const headers = adminAuth.getApiHeaders();
      const [analyticsRes, earningsRes] = await Promise.all([
        fetch(`${API_URL}/api/mongo/analytics`, { headers }),
        fetch(`${API_URL}/api/mongo/earnings`, { headers })
      ]);
      
      const analyticsData = await analyticsRes.json();
      const earningsData = await earningsRes.json();
      
      setAnalytics(analyticsData);
      setEarnings(earningsData);
    } catch (error) {
      console.error('Error fetching MongoDB data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics || !earnings) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">Loading dashboard data...</div>
      </div>
    );
  }

  const statCards = [
    { 
      title: "Total Users", 
      value: analytics.users.total, 
      icon: Users, 
      color: "text-blue-500",
      description: `${analytics.users.new} new this month`
    },
    { 
      title: "New Users", 
      value: analytics.users.new, 
      icon: UserPlus, 
      color: "text-green-500",
      description: "Last 30 days"
    },
    { 
      title: "Total Tasks", 
      value: analytics.tasks.total, 
      icon: ShoppingBag, 
      color: "text-purple-500",
      description: `${analytics.tasks.buy} buy, ${analytics.tasks.sell} sell`
    },
    { 
      title: "Buy Tasks", 
      value: analytics.tasks.buy, 
      icon: Package, 
      color: "text-orange-500",
      description: "Active buy requests"
    },
    { 
      title: "Total Task Value", 
      value: `₹${(analytics.value.totalTaskValue / 1000).toFixed(0)}K`, 
      icon: DollarSign, 
      color: "text-emerald-500",
      description: `₹${analytics.value.totalTaskValue.toLocaleString()}`
    },
    { 
      title: "Platform Commission", 
      value: `₹${(earnings.estimatedCommission / 1000).toFixed(0)}K`, 
      icon: TrendingUp, 
      color: "text-indigo-500",
      description: `${(earnings.commissionRate * 100)}% of total value`
    },
  ];

  return (
    <div className="space-y-6" data-testid="dashboard-container">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="dashboard-title">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your marketplace analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} data-testid={`stat-card-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid={`stat-value-${index}`}>{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="category-distribution-card">
          <CardHeader>
            <CardTitle>Tasks by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.tasks.byCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Tasks" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card data-testid="task-type-distribution-card">
          <CardHeader>
            <CardTitle>Tasks by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={earnings.productsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, count }) => `${type}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {earnings.productsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="commission-breakdown-card">
          <CardHeader>
            <CardTitle>Commission Breakdown by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={earnings.productsByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalValue" fill="#8884d8" name="Task Value (₹)" />
                <Bar dataKey="commission" fill="#82ca9d" name="Commission (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card data-testid="quick-stats-card">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Task Value:</span>
              <span className="font-bold">₹{earnings.totalTaskValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Platform Commission ({(earnings.commissionRate * 100)}%):</span>
              <span className="font-bold text-green-600">₹{earnings.estimatedCommission.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Tasks:</span>
              <span className="font-bold">{analytics.tasks.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Average Task Value:</span>
              <span className="font-bold">₹{Math.round(earnings.totalTaskValue / analytics.tasks.total).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Categories:</span>
              <span className="font-bold">{analytics.tasks.byCategory.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
