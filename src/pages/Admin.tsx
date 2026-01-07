import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, Mail, Lock, Users, Store, DollarSign, TrendingUp, Clock, Wallet, AlertCircle, Shield } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminWithdrawalApproval } from "@/components/admin/AdminWithdrawalApproval";

// Only this Pi Network username can access admin features
const AUTHORIZED_ADMIN_USERNAME = "Wain2020";

// Admin email for authentication
const ADMIN_EMAIL = "mrwain@dropstore.com";

const Admin = () => {
  const { user, signIn, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [piUser, setPiUser] = useState(null);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState(false);
  const [piAuthChecked, setPiAuthChecked] = useState(false);

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
    checkPiAuth();
  }, []);

  useEffect(() => {
    if (isAuthorizedAdmin) {
      fetchAdminData();
    }
  }, [isAuthorizedAdmin]);

  const checkPiAuth = async () => {
    try {
      console.log('Checking Pi Network authentication...');
      
      // Check if Pi Network is available
      if (typeof window !== 'undefined' && window.Pi) {
        const pi = window.Pi;
        
        try {
          // Authenticate with Pi Network
          const piUserData = await pi.authenticate([
            'payments', 
            'username'
          ], (payment: any) => {
            // Handle incomplete payment as per Pi documentation
            console.log('⚠️ Incomplete payment found:', payment);
          });
          
          console.log('Pi User Data:', piUserData);
          setPiUser(piUserData);
          
          // Get Pi username and check if it matches authorized admin
          const piUsername = piUserData?.user?.username || '';
          console.log('Pi Username:', piUsername);
          
          // Check for exact match with authorized admin username
          if (piUsername === AUTHORIZED_ADMIN_USERNAME || piUsername === `@${AUTHORIZED_ADMIN_USERNAME}`) {
            setIsAuthorizedAdmin(true);
            toast({
              title: "Admin Access Granted",
              description: `Welcome ${piUsername}! You have admin privileges.`,
            });
            console.log('Admin access granted for:', piUsername);
          } else {
            setIsAuthorizedAdmin(false);
            toast({
              title: "Access Denied",
              description: `Only ${AUTHORIZED_ADMIN_USERNAME} can access admin features. Current user: ${piUsername}`,
              variant: "destructive",
            });
            console.log('Admin access denied for:', piUsername);
          }
        } catch (piError) {
          console.error('Pi authentication failed:', piError);
          setIsAuthorizedAdmin(false);
          toast({
            title: "Pi Authentication Failed",
            description: "Could not authenticate with Pi Network. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        console.log('Pi Network not available - not in Pi Browser');
        setIsAuthorizedAdmin(false);
        toast({
          title: "Pi Browser Required",
          description: "Admin access requires Pi Browser. Please open this app in Pi Browser.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error checking Pi authentication:', error);
      setIsAuthorizedAdmin(false);
    } finally {
      setPiAuthChecked(true);
    }
  };

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

  // Loading state for Pi authentication
  if (authLoading || !piAuthChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Checking admin authentication...</p>
        </div>
      </div>
    );
  }

  // Access denied if not authorized admin
  if (!isAuthorizedAdmin) {
    const currentUsername = piUser?.user?.username || 'Not authenticated';
    
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="w-16 h-16 text-red-500" />
              <CardTitle className="text-2xl text-center text-red-600">Admin Access Restricted</CardTitle>
              <CardDescription className="text-center space-y-2">
                <p>Only authorized administrators can access this panel.</p>
                <div className="bg-muted p-3 rounded-md">
                  <p className="font-medium text-green-600">Required: {AUTHORIZED_ADMIN_USERNAME}</p>
                  <p className="text-sm text-muted-foreground">Current: {currentUsername}</p>
                </div>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button 
              onClick={checkPiAuth}
              variant="outline"
              className="w-full"
            >
              <Shield className="w-4 h-4 mr-2" />
              Retry Pi Authentication
            </Button>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Pi Browser Required</AlertTitle>
              <AlertDescription>
                Make sure you're using Pi Browser and logged in as {AUTHORIZED_ADMIN_USERNAME}
              </AlertDescription>
            </Alert>
            <div className="mt-4">
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
              <AvatarImage src="https://i.ibb.co/rRN0sS7y/favicon.png" alt="Admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome, {piUser?.user?.username || AUTHORIZED_ADMIN_USERNAME} - Authenticated via Pi Network
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-green-100 text-green-800">
              {piUser?.user?.username || AUTHORIZED_ADMIN_USERNAME}
            </Badge>
            <Badge variant="outline">2% Platform Fee</Badge>
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
              <LogOut className="w-4 h-4 mr-2" />
              Exit Admin
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="stores">Stores</TabsTrigger>
                <TabsTrigger value="payouts">Payouts</TabsTrigger>
                <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
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

              <TabsContent value="withdrawals">
                <AdminWithdrawalApproval />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;