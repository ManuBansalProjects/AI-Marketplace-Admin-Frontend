import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Percent, CreditCard, Package } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { adminAuth } from "@/lib/adminAuth";


const API_URL = import.meta.env.VITE_API_URL;

interface MongoEarnings {
  totalTaskValue: number;
  estimatedCommission: number;
  commissionRate: number;
  netEarnings: number;
  productsByType: Array<{
    type: string;
    count: number;
    totalValue: number;
    commission: number;
  }>;
  totalProducts: number;
}

interface Payment {
  _id: string;
  amount: number;
  method: string;
  description?: string;
  status: string;
  paidAt: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
    phone: string;
  };
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

const Earnings = () => {
  const [earnings, setEarnings] = useState<MongoEarnings | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const fetchEarningsData = async () => {
    try {
      const headers = adminAuth.getApiHeaders();
      const [earningsRes, paymentsRes] = await Promise.all([
        fetch(`${API_URL}/api/mongo/earnings`, { headers }),
        fetch(`${API_URL}/api/mongo/payments`, { headers })
      ]);
      
      const earningsData = await earningsRes.json();
      const paymentsData = await paymentsRes.json();
      
      setEarnings(earningsData);
      setPayments(paymentsData.payments || []);
    } catch (error) {
      console.error('Error fetching earnings data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !earnings) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">Loading earnings data...</div>
      </div>
    );
  }

  const totalPayouts = payments.reduce((sum, p) => sum + p.amount, 0);

  const statCards = [
    { 
      title: "Total Task Value", 
      value: `₹${(earnings.totalTaskValue / 1000).toFixed(0)}K`, 
      icon: Package, 
      color: "text-blue-500",
      description: `₹${earnings.totalTaskValue.toLocaleString()}`
    },
    { 
      title: "Platform Commission", 
      value: `₹${(earnings.estimatedCommission / 1000).toFixed(0)}K`, 
      icon: Percent, 
      color: "text-emerald-500",
      description: `${(earnings.commissionRate * 100)}% commission rate`
    },
    { 
      title: "Total Payouts", 
      value: `₹${(totalPayouts / 1000).toFixed(0)}K`, 
      icon: CreditCard, 
      color: "text-purple-500",
      description: `₹${totalPayouts.toLocaleString()} paid to users`
    },
    { 
      title: "Net Revenue", 
      value: `₹${((earnings.estimatedCommission - totalPayouts) / 1000).toFixed(0)}K`, 
      icon: TrendingUp, 
      color: "text-orange-500",
      description: "Commission - Payouts"
    },
  ];

  return (
    <div className="space-y-6" data-testid="earnings-container">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="earnings-title">Earnings & Payments</h1>
        <p className="text-muted-foreground">Track revenue, commissions, and user payouts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <Card data-testid="commission-by-type-card">
          <CardHeader>
            <CardTitle>Commission by Task Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={earnings.productsByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="totalValue" fill="#8884d8" name="Task Value (₹)" />
                <Bar dataKey="commission" fill="#82ca9d" name="Commission (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card data-testid="task-distribution-card">
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
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

      <Card data-testid="commission-breakdown-card">
        <CardHeader>
          <CardTitle>Detailed Commission Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Type</TableHead>
                  <TableHead>Number of Tasks</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Commission ({(earnings.commissionRate * 100)}%)</TableHead>
                  <TableHead>Avg Task Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.productsByType.map((type) => (
                  <TableRow key={type.type} data-testid={`commission-row-${type.type}`}>
                    <TableCell className="font-medium capitalize">
                      <Badge variant="outline">{type.type}</Badge>
                    </TableCell>
                    <TableCell>{type.count}</TableCell>
                    <TableCell className="font-semibold">₹{type.totalValue.toLocaleString()}</TableCell>
                    <TableCell className="text-green-600 font-semibold">
                      ₹{type.commission.toLocaleString()}
                    </TableCell>
                    <TableCell>₹{Math.round(type.totalValue / type.count).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell>{earnings.totalProducts}</TableCell>
                  <TableCell>₹{earnings.totalTaskValue.toLocaleString()}</TableCell>
                  <TableCell className="text-green-600">₹{earnings.estimatedCommission.toLocaleString()}</TableCell>
                  <TableCell>₹{Math.round(earnings.totalTaskValue / earnings.totalProducts).toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="payment-history-card">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payments made yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment._id} data-testid={`payment-row-${payment._id}`}>
                      <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{payment.user?.name || "-"}</div>
                          <div className="text-muted-foreground text-xs">{payment.user?.phone || "-"}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ₹{payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{payment.method}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {payment.description || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{payment.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Earnings;
