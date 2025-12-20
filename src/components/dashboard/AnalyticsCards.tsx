import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package,
  BarChart3,
  Eye
} from 'lucide-react';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  revenueChange: number;
  ordersChange: number;
  pendingOrders: number;
  completedOrders: number;
}

interface AnalyticsCardsProps {
  data: AnalyticsData;
}

export function AnalyticsCards({ data }: AnalyticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-display font-bold">{data.totalRevenue.toFixed(2)} π</p>
              <div className={`flex items-center gap-1 text-xs mt-1 ${
                data.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {data.revenueChange >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(data.revenueChange)}% from last month
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-display font-bold">{data.totalOrders}</p>
              <div className={`flex items-center gap-1 text-xs mt-1 ${
                data.ordersChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {data.ordersChange >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(data.ordersChange)}% from last month
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-display font-bold">{data.totalProducts}</p>
              <p className="text-xs text-muted-foreground mt-1">Across all stores</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Order Value</p>
              <p className="text-2xl font-display font-bold">{data.averageOrderValue.toFixed(2)} π</p>
              <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function OrderStatusCards({ pending, completed }: { pending: number; completed: number }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Eye className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{pending}</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-500">Pending Orders</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{completed}</p>
              <p className="text-xs text-green-600 dark:text-green-500">Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}