import FunkyPagesHero from 'components/general/FunkyPagesHero';
import PillTabs from 'components/general/PillTabs';
import SearchComboBox from 'components/general/SearchComboBox';
import { useEffect, useState } from 'react';
import demoAd from 'assets/image/dashboardAdSample.png';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Icon, { iconTypes } from 'utils/Icon';
import BlogCard from 'components/general/ProductCard';
import blogImg from 'assets/image/blogImg.png?format=webp&w=330&h=280&imagetools';
import dpIcon from 'assets/image/demoDp.jpg?format=webp&imagetools';
import BtsCard from 'components/general/BtsCard';
import filmImg from 'assets/image/heyyou.png?format=webp&w=240&h=153&imagetools';
import AssetCard from 'components/general/AssetCard';
import assetImg from 'assets/image/assetFilmImg.png';
import { shimmer, toBase64 } from 'utils/general/shimmer';
import { useQuery } from '@tanstack/react-query';
import { apiInterface, contentApiItemInterface, productInterface } from 'types';

import { processError } from 'helper/error';
import CONSTANTS from 'constant';
import ContentLoader from 'components/general/ContentLoader';
import EmptyContentWrapper from 'components/Hocs/EmptyContentWrapper';

import { filterStringsContainingImageExtensions } from 'helper';
import { useNavigate } from 'react-router-dom';
import { data } from './dashboardData';
import { cn } from 'lib/utils';
import PieChartComponent from 'components/general/Charts/PieChart';
import LineChartComponent from 'components/general/Charts/LineChart';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'components/shadcn/dropdown-menu';
import { Button } from 'components/shadcn/ui/button';
import { ChevronDown, Filter } from 'lucide-react';
import { collection } from 'firebase/firestore';
import { db } from 'firebase';
import TextContentLoader from 'components/Loaders/TextContentLoader';
import useStore from 'store';
import InlineLoader from 'components/Loaders/InlineLoader';
import { getDocs, query, orderBy, limit } from 'firebase/firestore';
import { formatToNaira, statusColor } from 'lib/utils';
import { Order } from 'types';
import { DateRangePicker } from 'components/general/DateRangePicker';
import moment from 'moment';

type filterTypes = 'All' | 'Adverts' | 'Blog Posts' | 'BTS' | 'Assets' | 'Upcoming Events';

const generalFilters: filterTypes[] = [
  'All',
  'Adverts',
  'Blog Posts',
  'BTS',
  'Assets',
  'Upcoming Events',
];

const Dashboard = () => {
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [position, setPosition] = useState('bottom');
  //TODO: handle key searchparam of type filterTypes

  const { currentUser, authDetails } = useStore((state) => state);
  const navigate = useNavigate();



  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', dateRange],
    queryFn: async () => {
      // Helper: filter any collection's docs by the selected date range
      const filterByDateRange = (docs: any[], dateFields: string[]) => {
        if (!dateRange.start && !dateRange.end) return docs;
        return docs.filter((doc) => {
          const rawDate = dateFields.map((f) => doc[f]).find((v) => v != null);
          if (!rawDate) return false;
          const date = (rawDate as any)?.seconds
            ? new Date((rawDate as any).seconds * 1000)
            : new Date(rawDate);
          if (isNaN(date.getTime())) return false;
          if (dateRange.start && date < dateRange.start) return false;
          if (dateRange.end && date > dateRange.end) return false;
          return true;
        });
      };

      // --- Orders ---
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const allOrders = ordersSnap.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as unknown as Order),
      );

      // --- Users ---
      const usersSnap = await getDocs(collection(db, 'users'));
      const allUsers = usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const filteredUsers = filterByDateRange(allUsers, ['createdAt', 'created_at', 'created_date', 'createdDate']);

      // --- Products ---
      const productsSnap = await getDocs(collection(db, 'newProducts'));
      const allProducts = productsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const filteredProducts = filterByDateRange(allProducts, ['createdAt', 'created_at', 'created_date', 'createdDate']);

      // --- Categories ---
      const categoriesSnap = await getDocs(collection(db, 'categories'));
      const allCategories = categoriesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const filteredCategories = filterByDateRange(allCategories, ['createdAt', 'created_at', 'created_date', 'createdDate']);

      const filteredOrders = allOrders.filter((order) => {
        const rawDate = order.created_date || (order as any).createdDate;
        if (!rawDate) return false;
        
        // Handle Firestore Timestamp or String
        const orderDate = (rawDate as any)?.seconds 
          ? new Date((rawDate as any).seconds * 1000) 
          : new Date(rawDate);
          
        if (isNaN(orderDate.getTime())) return false;

        if (dateRange.start && orderDate < dateRange.start) return false;
        if (dateRange.end && orderDate > dateRange.end) return false;
        return true;
      });

      const totalRevenue = filteredOrders.reduce(
        (acc, order) => acc + (Number(order.totalAmount) || 0),
        0,
      );
      const totalOrdersCount = filteredOrders.length;
      const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

      // Recent Orders (Filtered by timeframe if applicable, but limited to 5)
      const recentOrders = [...filteredOrders]
        .sort((a, b) => {
          const dateA = (a.created_date as any)?.seconds 
            ? (a.created_date as any).seconds * 1000 
            : new Date(a.created_date as string).getTime();
          const dateB = (b.created_date as any)?.seconds 
            ? (b.created_date as any).seconds * 1000 
            : new Date(b.created_date as string).getTime();
          return (dateB || 0) - (dateA || 0);
        })
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

      const chartData = Object.entries(dailyRevenue)
        .map(([date, revenue]) => ({ 
          date, 
          name: moment(date).format('MMM D'), 
          revenue 
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Pie Chart: Status distribution (Reflecting filtered range with standardized colors)
      const statusCounts: Record<string, number> = {};
      filteredOrders.forEach((order) => {
        const status = order.status?.toLowerCase() || 'pending';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      const pieData = Object.entries(statusCounts).map(([name, value]) => ({
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
        avgOrderValue,
        usersCount: filteredUsers.length,
        productsCount: filteredProducts.length,
        categoriesCount: filteredCategories.length,
        recentOrders,
        chartData,
        pieData,
      };
    },
    onError: (err) => {
      processError(err);
    },
  });

  return (
    <div className='container flex h-full w-full flex-col overflow-auto px-container-base py-[1rem] pb-10 md:px-container-md'>
      {/* <div className='flex items-center justify-between'>
        <h3 className='text-2xl font-bold'>Welcome Edmund</h3>
        <div className='flex  gap-3'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                className='group flex w-6/12 items-center justify-center gap-2 rounded-[5px]  border-0   px-2 py-4 text-base  font-semibold shadow-md transition-all duration-300 ease-in-out hover:opacity-90'
              >
                <Filter className='w-4 cursor-pointer fill-primary-4 stroke-primary-4   transition-opacity duration-300 ease-in-out hover:opacity-95 active:opacity-100' />
                <p className='text-[0.65rem] font-[500]'>Filter by</p>
                <ChevronDown className='w-4 cursor-pointer  transition-opacity duration-300 ease-in-out hover:opacity-95 active:opacity-100' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56 text-[0.65rem]'>
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
                <DropdownMenuRadioItem value='top'>Year</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value='bottom'>Month</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value='right'>Day</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <SearchComboBox />
        </div>
      </div> */}
      <section className=' grid gap-[4rem]  rounded-lg md:grid-cols-[2fr_1fr] '>
        <div>
          <div className='mb-16 flex items-center justify-between'>
            <h3 className='text-base font-bold md:text-2xl'>
              Welcome, {authDetails?.displayName ? authDetails.displayName : 'Admin'}
            </h3>
            <DateRangePicker onRangeChange={(range) => setDateRange(range)} />
          </div>
          <InlineLoader isLoading={statsLoading}>
            <div
              className={cn(
                'grid cursor-pointer grid-cols-[1fr] gap-[2rem] rounded-lg transition-all duration-500 ease-in-out md:grid-cols-[1fr_1fr_1fr] xxl:grid-cols-[1fr_1fr_1fr]',
              )}
            >
              <div
                onClick={() => navigate('/app/orders')}
                className='flex items-center gap-5 rounded-xl border bg-white px-6 py-5 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md'
              >
                <div className='flex items-center justify-center rounded-xl bg-emerald-50 px-5 py-5 '>
                  <Icon
                    svgProp={{ width: 24, height: 24, className: 'text-emerald-600' }}
                    name='cashIcon'
                  />
                </div>
                <div className='flex flex-col gap-1 text-[#1A1A1A]'>
                  <p className='text-xl font-black text-emerald-950'>
                    {formatToNaira(dashboardStats?.totalRevenue || 0)}
                  </p>
                  <h3 className='text-[0.7rem] font-bold uppercase tracking-wider text-gray-400'>
                    Total Revenue
                  </h3>
                </div>
              </div>

              <div
                onClick={() => navigate('/app/orders')}
                className='flex items-center gap-5 rounded-xl border bg-white px-6 py-5 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md'
              >
                <div className='flex items-center justify-center rounded-xl bg-blue-50 px-5 py-5 '>
                  <Icon
                    svgProp={{ width: 24, height: 24, className: 'text-blue-600' }}
                    name='OrderIcon'
                  />
                </div>
                <div className='flex flex-col gap-1 text-[#1A1A1A]'>
                  <p className='text-xl font-black text-blue-950'>
                    {dashboardStats?.totalOrdersCount || 0}
                  </p>
                  <h3 className='text-[0.7rem] font-bold uppercase tracking-wider text-gray-400'>
                    Total Orders
                  </h3>
                </div>
              </div>

              <div className='flex items-center gap-5 rounded-xl border bg-white px-6 py-5 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md'>
                <div className='flex items-center justify-center rounded-xl bg-amber-50 px-5 py-5 '>
                  <Icon
                    svgProp={{ width: 24, height: 24, className: 'text-amber-600' }}
                    name='billing'
                  />
                </div>
                <div className='flex flex-col gap-1 text-[#1A1A1A]'>
                  <p className='text-xl font-black text-amber-950'>
                    {formatToNaira(dashboardStats?.avgOrderValue || 0)}
                  </p>
                  <h3 className='text-[0.7rem] font-bold uppercase tracking-wider text-gray-400'>
                    Avg. Order Value
                  </h3>
                </div>
              </div>

              <div
                onClick={() => navigate('/app/users')}
                className='flex items-center gap-5 rounded-xl border bg-white px-6 py-5 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md'
              >
                <div className='flex items-center justify-center rounded-xl bg-blue-50 px-5 py-5'>
                  <Icon svgProp={{ width: 24, height: 24, className: 'text-blue-600' }} name='RegUsers' />
                </div>
                <div className='flex flex-col gap-1 text-[#1A1A1A]'>
                  <p className='text-xl font-black text-blue-950'>{dashboardStats?.usersCount ?? 0}</p>
                  <h3 className='text-[0.7rem] font-bold uppercase tracking-wider text-gray-400'>Registered Users</h3>
                </div>
              </div>

              <div
                onClick={() => navigate('/app/products')}
                className='flex items-center gap-5 rounded-xl border bg-white px-6 py-5 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md'
              >
                <div className='flex items-center justify-center rounded-xl bg-amber-50 px-5 py-5'>
                  <Icon svgProp={{ width: 24, height: 24, className: 'text-amber-600' }} name='ProductIcon' />
                </div>
                <div className='flex flex-col gap-1 text-[#1A1A1A]'>
                  <p className='text-xl font-black text-amber-950'>{dashboardStats?.productsCount ?? 0}</p>
                  <h3 className='text-[0.7rem] font-bold uppercase tracking-wider text-gray-400'>Products</h3>
                </div>
              </div>

              <div
                onClick={() => navigate('/app/categories')}
                className='flex items-center gap-5 rounded-xl border bg-white px-6 py-5 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md'
              >
                <div className='flex items-center justify-center rounded-xl bg-emerald-50 px-5 py-5'>
                  <Icon svgProp={{ width: 24, height: 24, className: 'text-emerald-600' }} name='CategoryIcon' />
                </div>
                <div className='flex flex-col gap-1 text-[#1A1A1A]'>
                  <p className='text-xl font-black text-emerald-950'>{dashboardStats?.categoriesCount ?? 0}</p>
                  <h3 className='text-[0.7rem] font-bold uppercase tracking-wider text-gray-400'>Categories</h3>
                </div>
              </div>
            </div>
          </InlineLoader>

          <div className='mt-12 hidden md:block'>
            <p className='mb-10 text-lg font-bold text-primary-1'>Sales Overview</p>
            {dashboardStats?.chartData && dashboardStats.chartData.length > 0 ? (
              <div className='rounded-xl border p-4 shadow-sm'>
                <LineChartComponent data={dashboardStats.chartData} dataKey='revenue' width={800} />
              </div>
            ) : (
              <div className='flex h-[300px] items-center justify-center rounded-xl border bg-gray-50'>
                <p className='text-gray-400 font-medium italic text-sm'>No sales data available for this range.</p>
              </div>
            )}
          </div>

          <div className='mt-12'>
            <div className='mb-6 flex items-center justify-between'>
              <p className='text-lg font-bold text-primary-1'>Recent Orders</p>
              <Button
                variant='ghost'
                className='text-xs text-primary-1'
                onClick={() => navigate('/app/orders')}
              >
                See all
              </Button>
            </div>
            <div className='overflow-x-auto rounded-lg border shadow-sm'>
              <table className='w-full text-left text-sm'>
                <thead className='bg-gray-50 text-xs uppercase text-gray-700'>
                  <tr>
                    <th className='px-4 py-3'>Order ID</th>
                    <th className='px-4 py-3'>Customer</th>
                    <th className='px-4 py-3'>Amount</th>
                    <th className='px-4 py-3'>Status</th>
                  </tr>
                </thead>
                <tbody className='divide-y'>
                  {dashboardStats?.recentOrders.map((order) => (
                    <tr key={order.id} className='hover:bg-gray-50 transition-colors'>
                      <td className='px-4 py-3 font-medium text-primary-1'>{order.orderId}</td>
                      <td className='px-4 py-3 capitalize'>{order.name}</td>
                      <td className='px-4 py-3 font-medium'>{formatToNaira(order.totalAmount)}</td>
                      <td className='px-4 py-3'>
                        <span
                          className={cn(
                            'rounded-full px-3 py-1 text-[10px] font-bold uppercase border',
                            statusColor(order.status),
                          )}
                        >
                          {order.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!dashboardStats?.recentOrders || dashboardStats.recentOrders.length === 0) && (
                    <tr>
                      <td colSpan={4} className='py-10 text-center text-gray-500'>
                        No recent orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-4'>
          <p className='text-xs font-semibold uppercase text-gray-500 md:text-right'>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>

          

          <div className='rounded-xl border p-6 shadow-sm'>
            <p className='mb-1 text-lg font-bold text-primary-1'>Order Mix</p>
            <p className='mb-4 text-xs text-gray-500 lowercase'>Current distribution by status</p>
            <div className='flex justify-center'>
              {dashboardStats?.pieData && (
                <PieChartComponent data={dashboardStats.pieData} width={220} height={220} />
              )}
            </div>
            <div className='mt-6 grid grid-cols-2 gap-4'>
              {dashboardStats?.pieData.map((item, idx) => (
                <div key={idx} className='flex items-center gap-2'>
                  <div
                    className='h-3 w-3 rounded-full'
                    style={{ 
                      backgroundColor: 
                        item.name.toLowerCase() === 'success' ? '#10B981' :
                        item.name.toLowerCase() === 'pending' ? '#F59E0B' :
                        item.name.toLowerCase() === 'en route' ? '#3B82F6' : 
                        item.name.toLowerCase() === 'delivered' ? '#6366F1' : '#94A3B8'
                    }}
                  ></div>
                  <p className='text-[0.7rem] font-medium text-gray-700'>
                    {item.name}: <span className='text-primary-1'>{item.value}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className='mt-4 flex flex-col gap-3 rounded-xl border bg-primary-1/5 p-6 shadow-sm'>
            <p className='text-lg font-bold  text-primary-1'>Analytics Deep Dive</p>
            <p className='text-[0.7rem] text-gray-600'>
              Discover top-selling products by quantity and revenue, and track your customer growth
              trends.
            </p>
            <button
              onClick={() => navigate('/app/analytics')}
              className='mt-2 rounded-md bg-primary-1 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95'
            >
              Go to Analytics
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
