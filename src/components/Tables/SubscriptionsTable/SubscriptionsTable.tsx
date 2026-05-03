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
  MoreVertical,
  Pause,
  StopCircle,
  Play,
} from 'lucide-react';

import { Button } from 'components/shadcn/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'components/shadcn/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'components/shadcn/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from 'components/shadcn/ui/alert-dialog';
import { collection, getDocs, orderBy, query, doc, updateDoc } from 'firebase/firestore';
import { db } from 'firebase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useStore from 'store';
import { cn, getCreatedDateFromDocument, formatToNaira } from 'lib/utils';
import FeaturedLoader from 'components/Loaders/FeaturedLoader';
import SearchComboBox from 'components/general/SearchComboBox';
import toast from 'helper';
import { processError } from 'helper/error';
import { Subscription } from 'types';
import moment from 'moment';

const ActionCell = ({ row, updateSubStatus }: { row: any, updateSubStatus: any }) => {
  const sub = row.original;
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [actionType, setActionType] = React.useState<'pause' | 'stop' | 'resume' | 'reactivate' | null>(null);

  const handleActionClick = (type: 'pause' | 'stop' | 'resume' | 'reactivate') => {
    setActionType(type);
    setAlertOpen(true);
  };

  const confirmAction = () => {
    if (actionType === 'pause') {
      updateSubStatus.mutate({ id: sub.id, status: 'paused' });
    } else if (actionType === 'stop') {
      updateSubStatus.mutate({ id: sub.id, status: 'stopped' });
    } else if (actionType === 'resume' || actionType === 'reactivate') {
      updateSubStatus.mutate({ id: sub.id, status: 'active' });
    }
    setAlertOpen(false);
  };

  const getAlertConfig = () => {
    switch (actionType) {
      case 'pause':
        return {
          title: 'Pause Subscription?',
          description: `This will pause the subscription for ${sub.productName}. You can resume it at any time to continue billing.`,
          actionClass: 'bg-yellow-600 hover:bg-yellow-700',
        };
      case 'stop':
        return {
          title: 'Stop Subscription?',
          description: `This will completely stop the subscription for ${sub.productName}. You can reactivate it later if needed.`,
          actionClass: 'bg-red-600 hover:bg-red-700',
        };
      case 'resume':
        return {
          title: 'Resume Subscription?',
          description: `This will reactivate billing and service for ${sub.productName}.`,
          actionClass: 'bg-green-600 hover:bg-green-700',
        };
      case 'reactivate':
        return {
          title: 'Reactivate Subscription?',
          description: `This will restart the subscription for ${sub.productName} and resume billing cycles.`,
          actionClass: 'bg-green-600 hover:bg-green-700',
        };
      default:
        return { title: '', description: '', actionClass: '' };
    }
  };

  const alertConfig = getAlertConfig();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <MoreVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-40'>
          {sub.status === 'paused' ? (
            <DropdownMenuItem onClick={(e) => { e.preventDefault(); handleActionClick('resume'); }}>
              <Play className='mr-2 h-4 w-4 text-green-600' />
              <span>Resume</span>
            </DropdownMenuItem>
          ) : sub.status === 'stopped' ? (
            <DropdownMenuItem onClick={(e) => { e.preventDefault(); handleActionClick('reactivate'); }}>
              <Play className='mr-2 h-4 w-4 text-green-600' />
              <span>Reactivate</span>
            </DropdownMenuItem>
          ) : sub.status === 'active' ? (
            <DropdownMenuItem onClick={(e) => { e.preventDefault(); handleActionClick('pause'); }}>
              <Pause className='mr-2 h-4 w-4 text-yellow-600' />
              <span>Pause</span>
            </DropdownMenuItem>
          ) : null}
          
          {sub.status !== 'stopped' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); handleActionClick('stop'); }}>
                <StopCircle className='mr-2 h-4 w-4 text-red-600' />
                <span>Stop</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertConfig.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmAction}
              className={alertConfig.actionClass}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

function SubscriptionsTable() {
  const { authDetails } = useStore();
  const queryClient = useQueryClient();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const fetchSubscriptions = async () => {
    const subsRef = collection(db, 'subscriptions');
    const q = query(subsRef, orderBy('created_date', 'desc'));
    const querySnapshot = await getDocs(q);
    const subs: Subscription[] = [];
    querySnapshot.forEach((doc) => {
      const created = getCreatedDateFromDocument(doc as any);
      subs.push({ id: doc.id, ...doc.data(), created_date: created } as Subscription);
    });
    return subs;
  };

  const { isLoading, data: subscriptions = [] } = useQuery({
    queryKey: ['get-subscriptions', authDetails?.uid],
    queryFn: fetchSubscriptions,
    enabled: !!authDetails?.uid,
  });

  const updateSubStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Subscription['status'] }) => {
      const subRef = doc(db, 'subscriptions', id);
      await updateDoc(subRef, { status });
      return { id, status };
    },
    onSuccess: () => {
      toast.success('Subscription updated successfully');
      queryClient.invalidateQueries(['get-subscriptions']);
    },
    onError: (err) => processError(err),
  });

  const columns: ColumnDef<Subscription>[] = [
    {
      accessorKey: 'productName',
      header: 'Product',
      cell: ({ row }) => {
        const rawImage = row.original.productImage || (row.original as any).image || (row.original as any).productImg || (row.original as any).product_image || (row.original as any).imageUrl;
        let image = '';
        if (typeof rawImage === 'string') {
          image = rawImage;
        } else if (Array.isArray(rawImage) && rawImage.length > 0) {
          image = rawImage[0]?.url || rawImage[0];
        }

        return (
          <div className='flex items-center gap-3 text-[0.71rem]'>
            {image && (
              <img src={image} className='h-8 w-8 rounded-md object-cover' alt='' />
            )}
            <span className='font-semibold'>{row.getValue('productName')}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'userName',
      header: 'Customer',
      cell: ({ row }) => (
        <div className='text-[0.71rem]'>
          <p className='font-medium'>{row.getValue('userName') || 'N/A'}</p>
          <p className='text-gray-500'>{row.original.userEmail}</p>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const colors: Record<string, string> = {
          active: 'bg-green-100 text-green-700 border-green-200',
          paused: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          stopped: 'bg-red-100 text-red-700 border-red-200',
          failed: 'bg-orange-100 text-orange-700 border-orange-200',
        };
        return (
          <span className={cn('px-2 py-1 rounded-full text-[0.65rem] font-bold uppercase border', colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700')}>
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Payment Status',
      cell: ({ row }) => {
        const pStatus = row.getValue('paymentStatus') as string;
        const colors: Record<string, string> = {
          success: 'bg-green-100 text-green-700 border-green-200',
          failed: 'bg-red-100 text-red-700 border-red-200',
        };
        return (
          <span className={cn('px-2 py-1 rounded-full text-[0.65rem] font-bold uppercase border', colors[pStatus?.toLowerCase()] || 'bg-gray-100 text-gray-700')}>
            {pStatus || 'N/A'}
          </span>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Monthly Amount',
      cell: ({ row }) => (
        <div className='text-[0.71rem] font-medium'>{formatToNaira(row.getValue('amount'))}</div>
      ),
    },
    {
      accessorKey: 'nextBillingDate',
      header: 'Next Billing',
      cell: ({ row }) => {
        const date = row.original.nextBillingDate;
        return (
          <div className='text-[0.71rem]'>
            {date ? moment((date as any).seconds * 1000).format('MMM DD, YYYY') : 'N/A'}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => <ActionCell row={row} updateSubStatus={updateSubStatus} />,
    },
  ];

  const table = useReactTable({
    data: subscriptions,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });


  console.log("ew", subscriptions)

  return (
    <div className='flex w-full flex-col gap-4'>
      <div className='flex flex-col md:flex-row justify-between items-start sm:items-center'>
        <h3 className='text-xl font-semibold'>Manage Subscriptions</h3>
       <div className='max-w-2xl'>
         <SearchComboBox
          value={(table.getColumn('productName')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('productName')?.setFilterValue(event.target.value)}
        />
       </div>
      </div>

      <FeaturedLoader isLoading={isLoading}>
        <div className='rounded-md border'>
          <Table>
            <TableHeader className='bg-gray-50'>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className='text-[0.75rem] font-bold text-black uppercase px-4'>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className='px-4 py-3'>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className='h-24 text-center'>
                    No subscriptions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </FeaturedLoader>
      
      <div className='flex items-center justify-between p-2'>
        <div className='text-xs text-muted-foreground'>
          Total {subscriptions.length} subscriptions
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button variant='outline' size='sm' onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionsTable;
