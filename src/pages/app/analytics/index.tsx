import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from 'firebase';
import { Order, authDetailsInterface } from 'types';
import { formatToNaira, cn } from 'lib/utils';
import Icon from 'utils/Icon';
import LineChartComponent from 'components/general/Charts/LineChart';
import PieChartComponent from 'components/general/Charts/PieChart';
import InlineLoader from 'components/Loaders/InlineLoader';
import { processError } from 'helper/error';
import useStore from 'store';
import { useState, useMemo } from 'react';
import { DateRangePicker } from 'components/general/DateRangePicker';
import moment from 'moment';

const Analytics = () => {
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const { authDetails } = useStore((state) => state);

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics-data', dateRange],
    queryFn: async () => {
      // Fetch Orders
      const ordersRef = collection(db, 'orders');
      const ordersSnap = await getDocs(ordersRef);
      const allOrders = ordersSnap.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as unknown as Order),
      );

      const filteredOrders = allOrders.filter((order) => {
        const rawDate = order.created_date || (order as any).createdDate;
        if (!rawDate) return false;
        
        // Handle Firestore Timestamp or String
        const orderDate = (rawDate as any)?.seconds 
          ? new Date((rawDate as any).seconds * 1000) 
          : new Date(rawDate as string);
          
        if (isNaN(orderDate.getTime())) return false;

        if (dateRange.start && orderDate < dateRange.start) return false;
        if (dateRange.end && orderDate > dateRange.end) return false;
        return true;
      });

      // Fetch Users
      const usersRef = collection(db, 'users');
      const usersSnap = await getDocs(usersRef);
      const totalUsers = usersSnap.size;

      // 1. Basic Metrics
      const totalRevenue = filteredOrders.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);
      const totalOrdersCount = filteredOrders.length;

      // 2. Top Selling Products (by Quantity and Revenue)
      const productStats: Record<string, { quantity: number; revenue: number }> = {};
      filteredOrders.forEach((order) => {
        order.cartItems?.forEach((item) => {
          const name = item.name || 'Unknown Product';
          if (!productStats[name]) {
            productStats[name] = { quantity: 0, revenue: 0 };
          }
          productStats[name].quantity += Number(item.quantity) || 0;
          productStats[name].revenue += (Number(item.quantity) || 0) * (Number(item.price) || 0);
        });
      });

      const topByQuantity = Object.entries(productStats)
        .map(([name, stats]) => ({ name, value: stats.quantity }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      const topByRevenue = Object.entries(productStats)
        .map(([name, stats]) => ({ name, value: stats.revenue }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      // Chart Data: Daily Revenue with Zero-Filling for specific ranges
      const dailyRevenue: Record<string, number> = {};
      
      if (dateRange.start && dateRange.end) {
        // Fill zeroes for the entire selected range
        let current = moment(dateRange.start);
        const end = moment(dateRange.end);
        while (current.isSameOrBefore(end)) {
          dailyRevenue[current.format('YYYY-MM-DD')] = 0;
          current = current.add(1, 'days');
        }
      }

      filteredOrders.forEach((order) => {
        const rawDate = order.created_date || (order as any).createdDate;
        const dateKey = (rawDate as any)?.seconds 
          ? moment((rawDate as any).seconds * 1000).format('YYYY-MM-DD')
          : moment(rawDate).format('YYYY-MM-DD');
        dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + (Number(order.totalAmount) || 0);
      });

      const salesTrend = Object.entries(dailyRevenue)
        .map(([date, revenue]) => ({ 
          date, 
          name: moment(date).format('MMM D'), 
          revenue 
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // 4. Order Status Distribution
      const statusCounts: Record<string, number> = {};
      filteredOrders.forEach((order) => {
        const status = order.status?.toLowerCase() || 'pending';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color:
          name.toLowerCase() === 'success' ? '#10B981' :
          name.toLowerCase() === 'pending' ? '#F59E0B' :
          name.toLowerCase() === 'en route' ? '#3B82F6' : 
          name.toLowerCase() === 'delivered' ? '#6366F1' : '#94A3B8'
      }));

      return {
        totalRevenue,
        totalOrdersCount,
        totalUsers,
        topByQuantity,
        topByRevenue,
        salesTrend,
        statusDistribution,
      };
    },
    onError: (err) => processError(err),
  });

  return (
    <div className='container flex h-full w-full flex-col overflow-auto px-container-base py-[2rem] pb-20 md:px-container-md'>
      <div className='mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
        <div>
          <h2 className='text-3xl font-bold text-primary-1'>Analytics Dashboard</h2>
          <p className='text-sm text-gray-500'>Detailed insights across selected timeframes.</p>
        </div>
        <div className='flex items-center gap-4'>
            <DateRangePicker onRangeChange={(range) => setDateRange(range)} />
            <div className='flex items-center gap-3 rounded-lg bg-white p-2 shadow-sm border h-11 px-4'>
                <Icon svgProp={{width: 20, height: 20, className: 'text-primary-1'}} name='RegUsers' />
                <div className='text-xs'>
                    <p className='text-gray-400 capitalize font-bold leading-none mb-1'>Customer Base</p>
                    <p className='font-black text-primary-1'>{analyticsData?.totalUsers || 0}</p>
                </div>
            </div>
        </div>
      </div>

      <InlineLoader isLoading={isLoading}>
        {/* Core Metrics */}
        <div className='mb-10 grid gap-6 md:grid-cols-3'>
          <div className='rounded-2xl border bg-white p-8 shadow-sm transition-all hover:shadow-md'>
            <div className='flex items-center justify-between mb-4'>
                <p className='text-xs font-bold uppercase tracking-wider text-gray-400'>Total Revenue</p>
                <div className='p-2 bg-emerald-50 rounded-lg'>
                    <Icon svgProp={{width: 24, height: 24, className: 'text-emerald-600'}} name='NairaIcon' />
                </div>
            </div>
            <h3 className='text-4xl font-extrabold text-emerald-950'>
              {formatToNaira(analyticsData?.totalRevenue || 0)}
            </h3>
            <div className='mt-4 flex items-center gap-2 text-xs text-emerald-600'>
              <span className='rounded-full bg-emerald-100 px-2 py-0.5 font-bold'>+12.5%</span>
              <span className='text-gray-400'>vs last month</span>
            </div>
          </div>

          <div className='rounded-2xl border bg-white p-8 shadow-sm transition-all hover:shadow-md'>
            <div className='flex items-center justify-between mb-4'>
                <p className='text-xs font-bold uppercase tracking-wider text-gray-400'>Total Orders</p>
                <div className='p-2 bg-blue-50 rounded-lg'>
                    <Icon svgProp={{width: 24, height: 24, className: 'text-blue-600'}} name='OrderIcon' />
                </div>
            </div>
            <h3 className='text-4xl font-extrabold text-blue-950'>
              {analyticsData?.totalOrdersCount}
            </h3>
            <div className='mt-4 flex items-center gap-2 text-xs text-primary-1'>
              <span className='rounded-full bg-primary-1/10 px-2 py-0.5 font-bold'>Across selection</span>
            </div>
          </div>

          <div className='rounded-2xl border bg-white p-8 shadow-sm transition-all hover:shadow-md'>
            <div className='flex items-center justify-between mb-4'>
                <p className='text-xs font-bold uppercase tracking-wider text-gray-400'>Average Order Value</p>
                <div className='p-2 bg-amber-50 rounded-lg'>
                    <Icon svgProp={{width: 24, height: 24, className: 'text-amber-600'}} name='NairaIcon' />
                </div>
            </div>
            <h3 className='text-4xl font-extrabold text-amber-950'>
              {formatToNaira((analyticsData?.totalRevenue || 0) / (analyticsData?.totalOrdersCount || 1))}
            </h3>
            <div className='mt-4 flex items-center gap-2 text-xs text-blue-600'>
              <span className='rounded-full bg-blue-100 px-2 py-0.5 font-bold'>Efficiency score</span>
            </div>
          </div>
        </div>

        <div className='grid gap-8 lg:grid-cols-2'>
          {/* Sales Trend */}
          <div className='rounded-2xl border bg-white p-6 shadow-sm'>
            <h3 className='mb-8 text-xl font-bold text-gray-800'>Revenue Trend</h3>
            <div className='h-[350px] w-full'>
              {analyticsData?.salesTrend && analyticsData.salesTrend.length > 0 ? (
                <LineChartComponent
                  data={analyticsData.salesTrend}
                  width={600}
                  height={300}
                  dataKey='revenue'
                />
              ) : (
                <div className='flex h-[300px] items-center justify-center rounded-xl bg-gray-50 italic text-gray-400 text-sm'>
                   No trend data for this period.
                </div>
              )}
            </div>
          </div>

          {/* Status Distribution */}
          <div className='rounded-2xl border bg-white p-6 shadow-sm'>
            <h3 className='mb-8 text-xl font-bold text-gray-800'>Order Distribution</h3>
            <div className='flex flex-col items-center justify-center'>
              {analyticsData?.statusDistribution && (
                <PieChartComponent data={analyticsData.statusDistribution} width={280} height={280} />
              )}
              <div className='mt-10 grid grid-cols-2 gap-x-12 gap-y-4'>
                {analyticsData?.statusDistribution.map((item, idx) => (
                  <div key={idx} className='flex items-center gap-3'>
                    <div
                      className='h-4 w-4 rounded-full shadow-inner'
                      style={{
                        backgroundColor: 
                          item.name.toLowerCase() === 'success' ? '#10B981' :
                          item.name.toLowerCase() === 'pending' ? '#F59E0B' :
                          item.name.toLowerCase() === 'en route' ? '#3B82F6' : 
                          item.name.toLowerCase() === 'delivered' ? '#6366F1' : '#94A3B8'
                      }}
                    ></div>
                    <p className='text-sm font-semibold text-gray-700'>
                      {item.name}: <span className='text-primary-1 ml-1'>{item.value}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Products by Quantity */}
          <div className='rounded-2xl border bg-white p-6 shadow-sm'>
            <h3 className='mb-6 text-xl font-bold text-gray-800'>Top Products by Quantity</h3>
            <div className='space-y-4'>
              {analyticsData?.topByQuantity.map((product, idx) => (
                <div
                  key={idx}
                  className='flex items-center justify-between rounded-xl bg-gray-50 p-4 transition-transform hover:scale-[1.01]'
                >
                  <div className='flex items-center gap-4'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary-1 text-sm font-bold text-white shadow-lg'>
                      #{idx + 1}
                    </div>
                    <div>
                      <p className='font-bold text-gray-800 capitalize'>{product.name}</p>
                      <p className='text-xs text-gray-500'>Best seller</p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-lg font-black text-primary-1'>{product.value}</p>
                    <p className='text-[10px] font-bold uppercase text-gray-400'>Sold</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products by Revenue */}
          <div className='rounded-2xl border bg-white p-6 shadow-sm'>
            <h3 className='mb-6 text-xl font-bold text-gray-800'>Top Products by Revenue</h3>
            <div className='space-y-4'>
              {analyticsData?.topByRevenue.map((product, idx) => (
                <div
                  key={idx}
                  className='flex items-center justify-between rounded-xl bg-gray-50 p-4 border-l-4 border-l-green-500'
                >
                  <div className='flex items-center gap-4'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white shadow-lg'>
                      #{idx + 1}
                    </div>
                    <div>
                      <p className='font-bold text-gray-800 capitalize'>{product.name}</p>
                      <p className='text-xs text-gray-500'>High value</p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-lg font-black text-green-700'>
                      {formatToNaira(product.value)}
                    </p>
                    <p className='text-[10px] font-bold uppercase text-gray-400'>Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </InlineLoader>
    </div>
  );
};

export default Analytics;
