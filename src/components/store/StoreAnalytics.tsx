import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Eye,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface StoreAnalyticsProps {
  storeId: string;
}

interface AnalyticsData {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  conversionRate: number;
  salesTrend: number;
  ordersTrend: number;
}

interface DailyData {
  date: string;
  sales: number;
  orders: number;
  visitors: number;
}

const COLORS = ['#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function StoreAnalytics({ storeId }: StoreAnalyticsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalCustomers: 0,
    conversionRate: 0,
    salesTrend: 0,
    ordersTrend: 0,
  });
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; sales: number }[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, [storeId, period]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', storeId)
        .gte('created_at', startDate.toISOString())
        .eq('status', 'paid');

      if (ordersError) throw ordersError;

      // Fetch previous period for comparison
      const prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - days);

      const { data: prevOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', storeId)
        .gte('created_at', prevStartDate.toISOString())
        .lt('created_at', startDate.toISOString())
        .eq('status', 'paid');

      // Calculate metrics
      const totalSales = (orders || []).reduce((sum, o) => sum + (o.total || 0), 0);
      const totalOrders = orders?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

      const prevTotalSales = (prevOrders || []).reduce((sum, o) => sum + (o.total || 0), 0);
      const prevTotalOrders = prevOrders?.length || 0;

      const salesTrend = prevTotalSales > 0 
        ? ((totalSales - prevTotalSales) / prevTotalSales) * 100 
        : 0;
      const ordersTrend = prevTotalOrders > 0 
        ? ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100 
        : 0;

      // Get unique customers
      const uniqueEmails = new Set((orders || []).map((o) => o.customer_email));

      setAnalytics({
        totalSales,
        totalOrders,
        averageOrderValue,
        totalCustomers: uniqueEmails.size,
        conversionRate: 3.2, // Placeholder - would need page view tracking
        salesTrend,
        ordersTrend,
      });

      // Generate daily data
      const dailyMap = new Map<string, DailyData>();
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyMap.set(dateStr, {
          date: dateStr,
          sales: 0,
          orders: 0,
          visitors: Math.floor(Math.random() * 50) + 10, // Placeholder
        });
      }

      (orders || []).forEach((order) => {
        const dateStr = order.created_at.split('T')[0];
        const existing = dailyMap.get(dateStr);
        if (existing) {
          existing.sales += order.total || 0;
          existing.orders += 1;
        }
      });

      setDailyData(
        Array.from(dailyMap.values())
          .sort((a, b) => a.date.localeCompare(b.date))
      );

      // Calculate top products
      const productSales = new Map<string, number>();
      (orders || []).forEach((order) => {
        const items = order.items as any[];
        if (Array.isArray(items)) {
          items.forEach((item) => {
            const name = item.name || 'Unknown';
            const current = productSales.get(name) || 0;
            productSales.set(name, current + (item.price || 0) * (item.quantity || 1));
          });
        }
      });

      setTopProducts(
        Array.from(productSales.entries())
          .map(([name, sales]) => ({ name, sales }))
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5)
      );
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => `${value.toFixed(2)}π`;
  const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

  const StatCard = ({
    title,
    value,
    trend,
    icon: Icon,
    format = 'number',
  }: {
    title: string;
    value: number;
    trend?: number;
    icon: any;
    format?: 'number' | 'currency' | 'percent';
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">
              {format === 'currency'
                ? formatCurrency(value)
                : format === 'percent'
                ? `${value.toFixed(1)}%`
                : value.toLocaleString()}
            </p>
            {trend !== undefined && (
              <div
                className={`flex items-center gap-1 mt-1 text-sm ${
                  trend >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {trend >= 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span>{formatPercent(trend)}</span>
                <span className="text-muted-foreground">vs last period</span>
              </div>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics</h2>
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sales"
          value={analytics.totalSales}
          trend={analytics.salesTrend}
          icon={DollarSign}
          format="currency"
        />
        <StatCard
          title="Orders"
          value={analytics.totalOrders}
          trend={analytics.ordersTrend}
          icon={ShoppingCart}
        />
        <StatCard
          title="Avg. Order Value"
          value={analytics.averageOrderValue}
          icon={Package}
          format="currency"
        />
        <StatCard
          title="Customers"
          value={analytics.totalCustomers}
          icon={Users}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  className="text-muted-foreground"
                />
                <YAxis
                  tickFormatter={(value) => `${value}π`}
                  className="text-muted-foreground"
                />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(2)}π`, 'Sales']}
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#0EA5E9"
                  strokeWidth={2}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Orders Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  className="text-muted-foreground"
                />
                <YAxis className="text-muted-foreground" />
                <Tooltip
                  formatter={(value: number) => [value, 'Orders']}
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="orders" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No sales data yet</p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      >
                        {index + 1}
                      </div>
                      <span className="font-medium truncate max-w-[200px]">{product.name}</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(product.sales)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Sales Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No sales data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={topProducts}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="sales"
                    nameKey="name"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {topProducts.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
