import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  MoreVertical,
  MoreVerticalIcon,
} from 'lucide-react';

import { Button } from 'components/shadcn/ui/button';
import { Checkbox } from 'components/shadcn/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from 'components/shadcn/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from 'components/shadcn/dialog';
import { Input } from 'components/shadcn/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'components/shadcn/ui/table';
import Icon from 'utils/Icon';
// import API from 'services';
import toast, { formatCurrentDateTime } from 'helper';
import { processError } from 'helper/error';
import { useNavigate } from 'react-router-dom';
import { cn,  getCreatedDateFromDocument } from 'lib/utils';
import { collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where, increment, writeBatch } from 'firebase/firestore';
import { db } from 'firebase';
import { formatToNaira, statusColor } from 'lib/utils';
import { useQuery } from '@tanstack/react-query';
import FeaturedLoader from 'components/Loaders/FeaturedLoader';
import SearchComboBox from 'components/general/SearchComboBox';

export type User = {
  id: string;
  number: string;
  name: string;
  city: string;
  status: string;
  email: string;
  orders: number;
  created: string;
  total: string;
  referralCode?: string;
  referredBy?: string;
};

function UserTableComponent() {
  const navigate = useNavigate();
  const [users, setUsers] = React.useState<any[]>([]);

  // Modal state
  const [selectedUser, setSelectedUser] = React.useState<any | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [editForm, setEditForm] = React.useState<{ displayName: string; email: string; phone: string }>({ displayName: '', email: '', phone: '' });
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // View modal tabs
  const [activeTab, setActiveTab] = React.useState<'profile' | 'wallet' | 'orders'>('profile');
  const [userWallet, setUserWallet] = React.useState<any | null>(null);
  const [userOrders, setUserOrders] = React.useState<any[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = React.useState(false);

  // Refund modal state
  const [refundOpen, setRefundOpen] = React.useState(false);
  const [refundAmount, setRefundAmount] = React.useState('');
  const [isRefunding, setIsRefunding] = React.useState(false);



  const handleUpdateWalletBalance = async () => {
    if (!selectedUser || !userWallet || !refundAmount) return;
    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid positive amount');
      return;
    }

    setIsRefunding(true);
    try {
      const walletId = userWallet.id;
      const walletRef = doc(db, 'wallets', walletId);

      await updateDoc(walletRef, {
        balance: increment(amount),
        totalDeposit: increment(amount),
      });

      // Update local state
      setUserWallet((prev: any) => ({
        ...prev,
        balance: (prev.balance || 0) + amount,
        totalDeposit: (prev.totalDeposit || 0) + amount,
      }));

      toast.success(`Successfully refunded ${formatToNaira(amount)} to user wallet`);
      setRefundOpen(false);
      setRefundAmount('');
    } catch (error) {
      console.error('[handleUpdateWalletBalance] error:', error);
      processError(error);
    } finally {
      setIsRefunding(false);
    }
  };


  const fetchUserDetails = async (targetUser: any) => {
    const userId = targetUser?.id;
    const email = (targetUser?.email || '').trim().toLowerCase();

    if (!userId && !email) return;
    setIsLoadingDetails(true);
    try {
      // ── Wallet ──────────────────────────────────────────────────────────
      // Strategy 1: wallet doc ID is the user's UID (most common Firebase pattern)
      let foundWallet: any = null;
      if (userId) {
        const walletDocRef = doc(db, 'wallets', userId);
        const walletDocSnap = await getDoc(walletDocRef);
        if (walletDocSnap.exists()) {
          foundWallet = { id: walletDocSnap.id, ...walletDocSnap.data() };

        }
      }
      // Strategy 2: query by email field
      if (!foundWallet && email) {
        const walletSnap = await getDocs(
          query(collection(db, 'wallets'), where('email', '==', email)),
        );

        if (!walletSnap.empty) {
          foundWallet = { id: walletSnap.docs[0].id, ...walletSnap.docs[0].data() };
        }
      }
      setUserWallet(foundWallet);

      // ── Orders ──────────────────────────────────────────────────────────
      // Strategy 1: query by email (normalized)
      let orderDocs: any[] = [];
      if (email) {
        const ordersSnap = await getDocs(
          query(collection(db, 'orders'), where('email', '==', email)),
        );

        orderDocs = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
      // Strategy 2: if empty, try querying by userId field
      if (orderDocs.length === 0 && userId) {
        const ordersSnap2 = await getDocs(
          query(collection(db, 'orders'), where('userId', '==', userId)),
        );

        orderDocs = ordersSnap2.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
      const sortedOrders = orderDocs
        .sort((a: any, b: any) => {
          const da = (a.created_date as any)?.seconds ?? 0;
          const db2 = (b.created_date as any)?.seconds ?? 0;
          return db2 - da;
        })
        .slice(0, 5);
      setUserOrders(sortedOrders);
    } catch (err) {
      console.error('[fetchUserDetails] error:', err);
      processError(err);
    } finally {
      setIsLoadingDetails(false);
    }
  };



  const deletePage = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'users', id));
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success('User deleted successfully');
      setDeleteOpen(false);
      setSelectedUser(null);
    } catch (error) {
      processError(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const saveEditedUser = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', selectedUser.id), {
        displayName: editForm.displayName,
        phone: editForm.phone,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, displayName: editForm.displayName, phone: editForm.phone }
            : u,
        ),
      );
      toast.success('User updated successfully');
      setEditOpen(false);
      setSelectedUser(null);
    } catch (error) {
      processError(error);
    } finally {
      setIsSaving(false);
    }
  };






  async function fetchAllUsers() {
    // 1. Fetch all users
    const usersCollectionRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersCollectionRef);

    // 2. Fetch all wallets to get referral balances
    const walletsCollectionRef = collection(db, 'wallets');
    const walletsSnapshot = await getDocs(walletsCollectionRef);
    
    // Create a map for quick lookup
    const walletMap: Record<string, any> = {};
    walletsSnapshot.forEach((doc) => {
      const data = doc.data();
      // Use doc.id (UID) or the userId field
      const key = data.userId || data.uid || doc.id;
      walletMap[key] = data;
    });

    const users: any = [];

    querySnapshot.forEach((doc) => {
      const createdDate = getCreatedDateFromDocument(doc as any);
      const rawData = doc.data();
      const _createdAtRaw =
        rawData.createdAt || rawData.created_at || rawData.created_date || rawData.createdDate || null;
      
      // Merge referralBalance from wallet map
      const userWallet = walletMap[doc.id];
      const referralBalance = userWallet?.referralBalance || 0;

      users.push({ 
        id: doc.id, 
        ...rawData, 
        referralBalance, // Injected from wallet
        created: createdDate, 
        _createdAtRaw 
      });
    });

    return users;
  }

  const columns: ColumnDef<any>[] = [
    {
      id: 'created',
      accessorKey: 'created',
      header: ({ column }) => {
        return (
          <Button
            className='px-0 text-[0.71rem] font-semibold'
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Created
            <Icon name='sort' svgProp={{ className: 'ml-2 h-3 w-2' }} />
          </Button>
        );
      },
      cell: ({ row }) => {
        const created = row.original.created;
        const rawDate = row.original._createdAtRaw;
        let displayDate = created || '—';
        if (rawDate) {
          const date = (rawDate as any)?.seconds
            ? new Date((rawDate as any).seconds * 1000)
            : new Date(rawDate);
          if (!isNaN(date.getTime())) {
            displayDate = date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
          }
        }
        return <div className='text-[0.71rem]'>{displayDate}</div>;
      },
    },

    {
      accessorKey: 'displayName',
      header: ({ column }) => {
        return (
          <Button
            className='px-0 text-[0.71rem] font-semibold'
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Name
            <Icon name='sort' svgProp={{ className: 'ml-2 h-3 w-2' }} />
          </Button>
        );
      },
      cell: ({ row }) => (
        // <Link to={`/mc/${CONSTANTS.ROUTES['overview']}}`}>
        <div className='text-[0.71rem] capitalize'>{row.getValue('displayName')}</div>
        // </Link>
      ),
      enableHiding: false,
    },
    {
      accessorKey: 'referralCode',
      header: ({ column }) => {
        return (
          <Button
            className='px-0 text-[0.71rem] font-semibold'
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Ref Code
            <Icon name='sort' svgProp={{ className: 'ml-2 h-3 w-2' }} />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className='flex w-fit items-center gap-2 rounded bg-blue-50 px-2 py-0.5 font-mono text-[0.71rem] text-blue-700'>
          {row.original.referralCode || '—'}
        </div>
      ),
    },
    {
      accessorKey: 'referralBalance',
      header: ({ column }) => {
        return (
          <Button
            className='px-0 text-[0.71rem] font-semibold'
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Ref Earnings
            <Icon name='sort' svgProp={{ className: 'ml-2 h-3 w-2' }} />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className='text-[0.71rem] font-semibold text-green-600'>
          {formatToNaira(row.original.referralBalance || 0)}
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: ({ column }) => {
        return (
          <Button
            className='px-0 text-[0.71rem] font-semibold   '
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Email
            <Icon name='sort' svgProp={{ className: 'ml-2 h-3 w-2' }} />
          </Button>
        );
      },
      cell: ({ row }) => (
        // <Link to={`/mc/${CONSTANTS.ROUTES['overview']}}`}>
        <div className='flex w-fit items-center   gap-2 rounded-lg'>
          <p className='text-center text-[0.71rem]  '>{row.getValue('email')}</p>
        </div>
        // </Link>
      ),
    },
    {
      accessorKey: 'address',
      header: ({ column }) => {
        return (
          <Button
            className='px-0 text-[0.71rem]  font-semibold'
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Address
            <Icon name='sort' svgProp={{ className: 'ml-2 h-3 w-2' }} />
          </Button>
        );
      },
      cell: ({ row }) => {
        const city = row.original.addressDetails?.address;
        return (
          <div className='flex w-fit items-center   gap-2 rounded-lg'>
            <p className='text-center text-[0.71rem]  '>{city}</p>
          </div>
        );
      },
    },

    {
      accessorKey: 'phone',
      header: ({ column }) => {
        return (
          <Button
            className='px-0 text-[0.71rem] font-semibold '
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Phone Number
            <Icon name='sort' svgProp={{ className: 'ml-2 h-3 w-2' }} />
          </Button>
        );
      },
      cell: ({ row }) => {
        const phone = row.original.phone;
        return (
          <div className='flex w-fit items-center   gap-2 rounded-lg  '>
            <p className='text-center text-[0.71rem] '>{phone}</p>
          </div>
        );
      },
    },

    {
      id: 'actions',
      enableHiding: false,
      header: () => <span className='text-[0.71rem] font-semibold'>Actions</span>,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open actions</span>
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-44'>
              <DropdownMenuLabel className='text-xs'>User Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='cursor-pointer text-xs'
                onClick={() => {
                  setSelectedUser(user);
                  setActiveTab('profile');
                  setUserWallet(null);
                  setUserOrders([]);
                  setViewOpen(true);
                  fetchUserDetails(user);
                }}
              >
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className='cursor-pointer text-xs'
                onClick={() => {
                  setSelectedUser(user);
                  setEditForm({
                    displayName: user.displayName || '',
                    email: user.email || '',
                    phone: user.phone || '',
                  });
                  setEditOpen(true);
                }}
              >
                Edit User
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='cursor-pointer text-xs text-red-600 focus:text-red-600'
                onClick={() => {
                  setSelectedUser(user);
                  setDeleteOpen(true);
                }}
              >
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState('');
  const table = useReactTable({
    data: users,
    columns,
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = (filterValue as string).toLowerCase().trim();
      if (!q) return true;
      const name = ((row.getValue('displayName') as string) || '').toLowerCase();
      const email = ((row.getValue('email') as string) || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const { isLoading, data } = useQuery({
    queryKey: ['get-users'],
    queryFn: () => fetchAllUsers(),
    onSuccess: (data) => {
      //  console.log(data)
      setUsers(data);
    },

    onError: (err) => {
      processError(err);
    },
  });




  return (
    <div className='flex w-full flex-col gap-2 rounded-xl   '>
      <div className='mb-8 flex flex-col md:mb-4 md:flex-row md:justify-between '>
        <h3 className='mb-6 flex items-center gap-3 text-base font-semibold md:mb-16 md:text-2xl'>
          User Accounts
          {!isLoading && (
            <span className='rounded-full bg-primary-1/10 px-2.5 py-0.5 text-xs font-bold text-primary-1'>
              {users.length} total
            </span>
          )}
        </h3>
        <div>
          <p className='mb-6 hidden text-end text-[0.75rem] text-gray-400 md:block'>
            {formatCurrentDateTime()}
          </p>
          <div className='flex items-center  gap-3'>
            {/* <DropdownMenu>
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
            </DropdownMenu> */}
            <SearchComboBox
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
            />
           
            <div className='flex  items-center justify-between gap-3'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='outline'
                    className='flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-medium'
                    title='Table Options'
                  >
                    <MoreHorizontal className='h-4 w-4' />
                    <span>Options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='px-4 py-4  pb-4'>
                  {/* <DropdownMenuLabel className='px-0 text-center text-sm font-normal'>
                Actions
              </DropdownMenuLabel> */}
                  <DropdownMenuItem
                    onClick={() => {
                      table.resetSorting();
                    }}
                    className='flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-center text-xs'
                  >
                    Reset Sorting
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className='my-2' />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className=''>
                        <Button variant='outline' className='py-1 text-xs'>
                          Columns <ChevronDown className='ml-2 h-3 w-3' />
                        </Button>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      {table
                        .getAllColumns()
                        .filter((column) => column.getCanHide())
                        .map((column) => {
                          return (
                            <DropdownMenuCheckboxItem
                              key={column.id}
                              className='text-xs capitalize'
                              checked={column.getIsVisible()}
                              onCheckedChange={(value) => column.toggleVisibility(!!value)}
                            >
                              {column.id}
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <FeaturedLoader isLoading={isLoading}>
        <Table className=''>
          <TableHeader className='border-0 bg-primary-6 [&_tr]:border-b-0'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='border-0   '>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className='border-b border-b-black/0 px-4  text-black'
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn('border-0 ', index % 2 === 0 ? '' : 'bg-slate-50')}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className=' py-3 font-medium'>
                      {/* <Link to={`/${CONSTANTS.ROUTES['view-usersList']}/${cell.id}`}> */}
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      {/* </Link> */}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-[400px] text-center'>
                  <div>
                    <p className='text-base font-semibold text-gray-500'>No Users Records</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </FeaturedLoader>

      {/* ── View Profile Modal (tabbed) ─────────────────── */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className='sm:max-w-lg bg-white'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-3'>
              <div className='flex h-9 w-9 items-center justify-center rounded-full bg-primary-1/10 text-sm font-bold text-primary-1'>
                {(selectedUser?.displayName || '?')[0].toUpperCase()}
              </div>
              <span>{selectedUser?.displayName || 'User Profile'}</span>
            </DialogTitle>
            <DialogDescription>{selectedUser?.email}</DialogDescription>
          </DialogHeader>

          {/* Tab bar */}
          <div className='flex gap-1 rounded-lg bg-gray-100 p-1'>
            {(['profile', 'wallet', 'orders'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-md py-1.5 text-xs font-semibold capitalize transition-all ${activeTab === tab
                    ? 'bg-white text-primary-1 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab === 'orders' ? 'Recent Orders' : tab === 'wallet' ? 'Wallet' : 'Profile'}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className='mt-1 min-h-[200px]'>
            {isLoadingDetails ? (
              <div className='flex h-[200px] items-center justify-center text-xs text-gray-400'>Loading…</div>
            ) : (
              <>
                {/* Profile tab */}
                {activeTab === 'profile' && (
                  <div className='grid grid-cols-2 gap-x-6 gap-y-4 text-sm'>
                    {[
                      { label: 'Full Name', value: selectedUser?.displayName },
                      { label: 'Email', value: selectedUser?.email },
                      { label: 'Phone', value: selectedUser?.phone },
                      { label: 'Address', value: selectedUser?.addressDetails?.address },
                      { label: 'City', value: selectedUser?.addressDetails?.city },
                      { label: 'Referral Code', value: selectedUser?.referralCode },
                      { label: 'Referred By', value: selectedUser?.referredBy },
                      { label: 'Status', value: selectedUser?.status || 'active' },
                      {
                        label: 'Joined',
                        value: selectedUser?._createdAtRaw
                          ? (() => {
                            const d = (selectedUser._createdAtRaw as any)?.seconds
                              ? new Date((selectedUser._createdAtRaw as any).seconds * 1000)
                              : new Date(selectedUser._createdAtRaw);
                            return isNaN(d.getTime())
                              ? selectedUser.created
                              : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                          })()
                          : selectedUser?.created,
                      },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className='text-[0.65rem] font-bold uppercase tracking-wide text-gray-400'>{label}</p>
                        <p className='mt-0.5 font-medium text-gray-800'>{value || '—'}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Wallet tab */}
                {activeTab === 'wallet' && (
                  <div>
                    {userWallet ? (
                      <div className='flex flex-col gap-4'>
                        <div className='grid grid-cols-2 gap-4'>
                          <div className='rounded-xl bg-emerald-50 p-4 text-center'>
                            <p className='text-[0.6rem] font-bold uppercase tracking-wider text-primary-1'>Main Balance</p>
                            <p className='mt-1 text-lg font-black text-primary-1'>{formatToNaira(userWallet.balance ?? 0)}</p>
                          </div>
                          <div className='rounded-xl bg-purple-50 p-4 text-center'>
                            <p className='text-[0.6rem] font-bold uppercase tracking-wider text-purple-600'>Referral Earnings</p>
                            <p className='mt-1 text-lg font-black text-purple-800'>{formatToNaira(userWallet.referralBalance ?? 0)}</p>
                          </div>
                          <div className='rounded-xl bg-blue-50 p-4 text-center'>
                            <p className='text-[0.6rem] font-bold uppercase tracking-wider text-blue-600'>Total Deposits</p>
                            <p className='mt-1 text-lg font-black text-blue-800'>{formatToNaira(userWallet.totalDeposit ?? 0)}</p>
                          </div>
                          <div className='rounded-xl bg-amber-50 p-4 text-center'>
                            <p className='text-[0.6rem] font-bold uppercase tracking-wider text-amber-600'>Total Spent</p>
                            <p className='mt-1 text-lg font-black text-amber-800'>{formatToNaira(userWallet.totalSpent ?? 0)}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setRefundOpen(true)}
                          className='w-full bg-primary-1 mt-6 text-white hover:bg-primary-1/80 h-10 py-1'
                        >
                          Refund / Add Funds
                        </Button>
                      </div>
                    ) : (
                      <div className='flex h-[160px] flex-col items-center justify-center gap-2 rounded-xl bg-gray-50'>
                        <p className='text-sm font-semibold text-gray-400'>No wallet found</p>
                        <p className='text-xs text-gray-400'>This user has no wallet record.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Orders tab */}
                {activeTab === 'orders' && (
                  <div>
                    {userOrders.length > 0 ? (
                      <div className='flex flex-col gap-2'>
                        {userOrders.map((order: any) => (
                          <div
                            key={order.id}
                            className='flex items-center justify-between rounded-lg border bg-gray-50 px-4 py-3'
                          >
                            <div>
                              <p className='text-xs font-bold text-primary-1 uppercase'>{order.orderId || order.id.slice(0, 8)}</p>
                              <p className='text-[0.65rem] text-gray-500 mt-0.5'>
                                {order.created_date?.seconds
                                  ? new Date(order.created_date.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                  : '—'}
                              </p>
                            </div>
                            <div className='flex items-center gap-3'>
                              <p className='text-sm font-bold text-gray-800'>{formatToNaira(Number(order.totalAmount) || 0)}</p>
                              <span
                                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusColor(order.status)}`}
                              >
                                {order.status || 'Pending'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='flex h-[160px] flex-col items-center justify-center gap-2 rounded-xl bg-gray-50'>
                        <p className='text-sm font-semibold text-gray-400'>No orders found</p>
                        <p className='text-xs text-gray-400'>This user hasn't placed any orders yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className='mt-4'>
            <Button variant='outline' onClick={() => setViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit User Modal ────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update the user's information below.</DialogDescription>
          </DialogHeader>
          <div className='mt-2 flex flex-col gap-4'>
            <div className='flex flex-col gap-1'>
              <label className='text-xs font-semibold text-gray-600'>Full Name</label>
              <input
                className='rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-1/40'
                value={editForm.displayName}
                onChange={(e) => setEditForm((f) => ({ ...f, displayName: e.target.value }))}
                placeholder='Full name'
              />
            </div>
            <div className='flex flex-col gap-1'>
              <label className='text-xs font-semibold text-gray-600'>Email</label>
              <input
                className='rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-400 outline-none'
                value={editForm.email}
                disabled
                placeholder='Email (read-only)'
              />
              <p className='text-[0.65rem] text-gray-400'>Email cannot be changed here.</p>
            </div>
            <div className='flex flex-col gap-1'>
              <label className='text-xs font-semibold text-gray-600'>Phone Number</label>
              <input
                className='rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-1/40'
                value={editForm.phone}
                onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder='Phone number'
              />
            </div>
          </div>
          <DialogFooter className='mt-4'>
            <Button variant='outline' onClick={() => setEditOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={saveEditedUser} disabled={isSaving} className='bg-primary-1 text-white hover:bg-primary-1/90'>
              {isSaving ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Alert ──────────────────── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle className='text-red-600'>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete{' '}
              <span className='font-semibold text-gray-800'>{selectedUser?.displayName || 'this user'}</span>?
              This action <span className='font-semibold text-red-600'>cannot be undone</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='mt-4'>
            <Button variant='outline' onClick={() => setDeleteOpen(false)} disabled={isDeleting}>Cancel</Button>
            <Button
              variant='destructive'
              onClick={() => selectedUser && deletePage(selectedUser.id)}
              disabled={isDeleting}
              className='bg-red-600 text-white hover:bg-red-700'
            >
              {isDeleting ? 'Deleting…' : 'Yes, Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      <div className='flex items-center justify-end space-x-2 p-4'>
        <div className='flex-1 text-xs text-muted-foreground'>
          Showing {table.getRowModel().rows?.length ?? 0} of {users?.length} results
        </div>
        <div className='space-x-2'>
          <Button
            variant='outline'
            size='sm'
            className='text-[0.71rem] '
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='text-[0.71rem] '
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
      {/* <button className='ml-4 w-fit rounded-sm bg-primary-1 px-4 py-1 text-[0.71rem]  text-white  '>
        Export
      </button> */}
      {/* ── Refund / Add Funds Dialog ─────────────────── */}
      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent className='sm:max-w-md bg-white'>
          <DialogHeader>
            <DialogTitle>Refund / Add Funds</DialogTitle>
            <DialogDescription>
              Add funds to <span className='font-semibold text-gray-800'>{selectedUser?.displayName}</span>'s wallet.
              The amount will be added to both current balance and total deposits.
            </DialogDescription>
          </DialogHeader>
          <div className='mt-4 flex flex-col gap-4'>
            <div className='flex flex-col gap-1'>
              <label className='text-xs font-semibold text-gray-600'>Amount (₦)</label>
              <Input
                type='number'
                className='rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-1/40'
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder='Enter amount to refund'
              />
            </div>
          </div>
          <DialogFooter className='mt-6'>
            <Button variant='outline' onClick={() => setRefundOpen(false)} disabled={isRefunding}>Cancel</Button>
            <Button
              onClick={handleUpdateWalletBalance}
              disabled={isRefunding || !refundAmount}
              className='bg-primary-1 text-white hover:bg-primary-1/80'
            >
              {isRefunding ? 'Processing…' : 'Confirm Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserTableComponent;
