import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, Mail, Lock, Users, Store, DollarSign, TrendingUp, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ADMIN_EMAIL = "admin@example.com";

const Admin = () => {
  const { user, signIn, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Admin data states
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeStores: 0,
    pendingPayouts: 0,
    totalRevenue: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Check if current user is the admin
  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    // If user is logged in but not admin, redirect to dashboard
    if (user && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [user, isAdmin, navigate, toast]);

  // Fetch admin data
  useEffect(() => {
    if (user && isAdmin) {
      fetchAdminData();
    }
  }, [user, isAdmin]);

  const fetchAdminData = async () => {
    setDataLoading(true);
    try {
      // Fetch total users count
      const { data: allUsersData } = await supabase
        .from('profiles')
        .select('id');
      const usersCount = allUsersData?.length || 0;

      // Fetch active stores count - using any type to bypass TypeScript issues
      const storesResponse = await (supabase as any)
        .from('stores')
        .select('id')
        .eq('is_active', true);
      const storesCount = storesResponse?.data?.length || 0;

      // Fetch pending payouts count
      const { data: pendingPayoutsData } = await supabase
        .from('merchant_payouts')
        .select('id')
        .eq('status', 'pending');
      const payoutsCount = pendingPayoutsData?.length || 0;

      // Fetch total revenue
      const { data: ordersData } = await supabase
        .from('orders')
        .select('total')
        .eq('status', 'completed');

      const totalRevenue = ordersData?.reduce((sum: number, order: any) => sum + (parseFloat(order.total) || 0), 0) || 0;

      // Fetch recent users
      const { data: recentUsersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch stores with user info
      const { data: storesData } = await supabase
        .from('stores')
        .select(`
          *,
          profiles(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch payouts with merchant info
      const { data: payoutsData } = await supabase
        .from('merchant_payouts')
        .select(`
          *,
          profiles(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      setStats({
        totalUsers: usersCount,
        activeStores: storesCount,
        pendingPayouts: payoutsCount,
        totalRevenue: Math.round(totalRevenue),
      });

      setUsers(recentUsersData || []);
      setStores(storesData || []);
      setPayouts(payoutsData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (email !== ADMIN_EMAIL) {
        // Sign out if not admin
        await signOut();
        setError("Access denied. Admin account required.");
        toast({
          title: "Access Denied",
          description: "This page is restricted to admin users only.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in to admin panel.",
        });
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Sign in form if not authenticated or not admin
  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <div className="flex flex-col items-center gap-2">
              <Avatar className="w-16 h-16">
                <AvatarImage src="https://i.ibb.co/C5PXP14b/Gemini-Generated-Image-9v9qpu9v9qpu9v9q-1-removebg-preview.png" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl text-center">Admin Portal</CardTitle>
              <p className="text-sm text-muted-foreground text-center">
                Sign in with your admin credentials
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Admin Email"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Password"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </form>
            <div className="mt-4 text-center">
              <Button
                variant="link"
                className="text-sm text-muted-foreground"
                onClick={() => navigate("/")}
              >
                Back to home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin Dashboard
  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, change: "+12%" },
    { label: "Active Stores", value: stats.activeStores, icon: Store, change: "+3%" },
    { label: "Pending Payouts", value: stats.pendingPayouts, icon: Clock, change: "-2%" },
    { label: "Revenue (Pi)", value: stats.totalRevenue, icon: DollarSign, change: "+23%" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src="https://i.ibb.co/C5PXP14b/Gemini-Generated-Image-9v9qpu9v9qpu9v9q-1-removebg-preview.png" alt="Admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome, {user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default">Admin</Badge>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        {dataLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                          <p className="text-2xl font-bold mt-1">{stat.value}</p>
                          <p className={`text-xs mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                            {stat.change} from last month
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="users" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="stores">Stores</TabsTrigger>
                <TabsTrigger value="payouts">Payouts</TabsTrigger>
              </TabsList>

              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {users.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No users found.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Pi Username</TableHead>
                            <TableHead>Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>{user.full_name || 'N/A'}</TableCell>
                              <TableCell>{user.email || 'N/A'}</TableCell>
                              <TableCell>{user.pi_username || 'N/A'}</TableCell>
                              <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stores">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Stores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stores.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No stores found.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Store Name</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stores.map((store) => (
                            <TableRow key={store.id}>
                              <TableCell className="font-medium">{store.name}</TableCell>
                              <TableCell>{store.profiles?.full_name || store.profiles?.email || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge variant={store.is_active ? "default" : "secondary"}>
                                  {store.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(store.created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payouts">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Payouts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {payouts.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No payouts found.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Merchant</TableHead>
                            <TableHead>Amount (Pi)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Requested</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payouts.map((payout) => (
                            <TableRow key={payout.id}>
                              <TableCell>{payout.profiles?.full_name || payout.profiles?.email || 'N/A'}</TableCell>
                              <TableCell>{payout.amount || 0} Pi</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    payout.status === 'completed' ? 'default' : 
                                    payout.status === 'pending' ? 'secondary' : 
                                    'destructive'
                                  }
                                >
                                  {payout.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(payout.created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;