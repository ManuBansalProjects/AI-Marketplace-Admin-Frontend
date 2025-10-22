import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, DollarSign, Package, ShoppingCart } from "lucide-react";
import { adminAuth } from "@/lib/adminAuth";


const API_URL = import.meta.env.VITE_API_URL;

interface MongoProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  task_type: string;
  category: string;
  subcategory?: string;
  created_by: string;
  createdAt: string;
  creator?: {
    name: string;
    email: string;
    phone: string;
  };
}

const Deals = () => {
  const [products, setProducts] = useState<MongoProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/mongo/products`, {
        headers: adminAuth.getApiHeaders()
      });
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "buy": return "default";
      case "sell": return "secondary";
      case "product": return "outline";
      default: return "outline";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "buy": return <ShoppingCart className="h-4 w-4" />;
      case "sell": return <Package className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.creator?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || product.task_type === filterType;
    
    return matchesSearch && matchesType;
  });

  const calculateCommission = (price: number, rate: number = 0.10) => {
    return price * rate;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="deals-container">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="deals-title">Products & Tasks</h1>
          <p className="text-muted-foreground">Manage all marketplace products and tasks</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Tasks</p>
          <p className="text-2xl font-bold" data-testid="total-tasks-count">{products.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Buy Tasks</p>
                <p className="text-2xl font-bold">{products.filter(p => p.task_type === 'buy').length}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sell Tasks</p>
                <p className="text-2xl font-bold">{products.filter(p => p.task_type === 'sell').length}</p>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">₹{products.reduce((sum, p) => sum + p.price, 0).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-products"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                onClick={() => setFilterType("all")}
                data-testid="filter-all"
              >
                All
              </Button>
              <Button
                variant={filterType === "buy" ? "default" : "outline"}
                onClick={() => setFilterType("buy")}
                data-testid="filter-buy"
              >
                Buy
              </Button>
              <Button
                variant={filterType === "sell" ? "default" : "outline"}
                onClick={() => setFilterType("sell")}
                data-testid="filter-sell"
              >
                Sell
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Commission (10%)</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product._id} data-testid={`product-row-${product._id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(product.task_type)}
                          <Badge variant={getTypeColor(product.task_type)}>
                            {product.task_type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium max-w-xs">
                        <div className="truncate" title={product.title}>{product.title}</div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate text-muted-foreground" title={product.description}>
                          {product.description || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-semibold">
                          <DollarSign className="h-4 w-4" />
                          ₹{product.price.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        ₹{calculateCommission(product.price).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{product.creator?.name || "-"}</div>
                          <div className="text-muted-foreground text-xs">{product.creator?.phone || "-"}</div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(product.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Deals;
