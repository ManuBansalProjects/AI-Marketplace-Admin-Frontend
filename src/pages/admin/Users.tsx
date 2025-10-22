import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { UserCheck, UserX, DollarSign, Search, Shield } from "lucide-react";
import { adminAuth } from "@/lib/adminAuth";


const API_URL = import.meta.env.VITE_API_URL;

interface MongoUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
  blocked?: boolean;
}

const Users = () => {
  const [users, setUsers] = useState<MongoUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<MongoUser | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [paymentDescription, setPaymentDescription] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/mongo/users`, {
        headers: adminAuth.getApiHeaders()
      });
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentBlocked?: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/mongo/users/${userId}/status`, {
        method: 'PATCH',
        headers: adminAuth.getApiHeaders(),
        body: JSON.stringify({ blocked: !currentBlocked })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(currentBlocked ? "User unblocked successfully!" : "User blocked successfully!");
        fetchUsers();
      } else {
        toast.error("Failed to update user status");
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error("Failed to update user status");
    }
  };

  const handlePayUser = async () => {
    if (!selectedUser || !paymentAmount) {
      toast.error("Please fill in all payment details");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/mongo/payments`, {
        method: 'POST',
        headers: adminAuth.getApiHeaders(),
        body: JSON.stringify({
          userId: selectedUser._id,
          amount: parseFloat(paymentAmount),
          method: paymentMethod,
          description: paymentDescription
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Payment of ₹${paymentAmount} sent to ${selectedUser.name}!`);
        setIsPaymentDialogOpen(false);
        setPaymentAmount("");
        setPaymentDescription("");
        setSelectedUser(null);
      } else {
        toast.error("Payment failed");
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error("Failed to process payment");
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="users-container">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="users-title">User Management</h1>
          <p className="text-muted-foreground">Manage all marketplace users</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-2xl font-bold" data-testid="total-users-count">{users.length}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-users"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id} data-testid={`user-row-${user._id}`}>
                    <TableCell className="font-medium">{user.name || "-"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || "-"}</TableCell>
                    <TableCell>
                      {user.blocked ? (
                        <Badge variant="destructive" data-testid={`status-blocked-${user._id}`}>Blocked</Badge>
                      ) : (
                        <Badge variant="default" data-testid={`status-active-${user._id}`}>Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant={user.blocked ? "outline" : "destructive"}
                          size="sm"
                          onClick={() => handleToggleUserStatus(user._id, user.blocked)}
                          data-testid={`button-toggle-status-${user._id}`}
                          title={user.blocked ? "Unblock User" : "Block User"}
                        >
                          {user.blocked ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                        </Button>
                        
                        <Dialog 
                          open={isPaymentDialogOpen && selectedUser?._id === user._id} 
                          onOpenChange={(open) => {
                            setIsPaymentDialogOpen(open);
                            if (open) {
                              setSelectedUser(user);
                            } else {
                              setSelectedUser(null);
                              setPaymentAmount("");
                              setPaymentDescription("");
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              data-testid={`button-pay-${user._id}`}
                              title="Pay User"
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Pay User: {user.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Amount (₹)</Label>
                                <Input
                                  type="number"
                                  value={paymentAmount}
                                  onChange={(e) => setPaymentAmount(e.target.value)}
                                  placeholder="0.00"
                                  data-testid="input-payment-amount"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Payment Method</Label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                  <SelectTrigger data-testid="select-payment-method">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="upi">UPI</SelectItem>
                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                  value={paymentDescription}
                                  onChange={(e) => setPaymentDescription(e.target.value)}
                                  placeholder="Payment for task/deal..."
                                  data-testid="input-payment-description"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handlePayUser} data-testid="button-confirm-payment">
                                Process Payment
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
