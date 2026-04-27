import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogTrigger } from 'components/shadcn/dialog';
import { useNavigate } from 'react-router-dom';
import { db } from 'firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { processError } from 'helper/error';
import toast from 'helper';
import ContentLoader from 'components/general/ContentLoader';
import { Order } from 'types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'components/shadcn/ui/table';
import { formatToNaira } from 'lib/utils';
import Spinner from 'components/shadcn/ui/spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'components/shadcn/ui/select';

interface Iprop {
  trigger: JSX.Element;
  triggerClassName?: string;
  title?: string;
  orderId: string;
}

const ViewOrderDetailsModal = ({
  trigger,
  triggerClassName,
  title,
  orderId,
}: Iprop) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const queryClient = useQueryClient();
  const [orderStatus, setOrderStatus] = useState<string>('');

  const navigate = useNavigate();

  const fetchSingleOrder = async () => {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('orderId', '==', orderId));

    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const firstDoc = querySnapshot.docs[0];
        return { id: firstDoc.id, ...firstDoc.data() };
      } else {
        console.log('No matching documents found.');
        return null;
      }
    } catch (error) {
      console.error('Error querying documents: ', error);
      return null;
    }
  };

  const { isLoading, data, refetch } = useQuery<any, any, Order>({
    queryKey: ['get-single-order', orderId],
    queryFn: () => fetchSingleOrder(),
    onSuccess: (data) => {
      setOrderStatus(data.status?.toLowerCase());
    },
    onError: (err) => {
      processError(err);
    },
  });

  const order = data as Order;

  const TableHeadings = ['Product', 'Price', 'Quantity', 'Subtotal'];



  const updateOrderStatus = useMutation({
    mutationFn: async (newStatus: string) => {
      if (order?.id) {
        setUpdating(true);
        const orderRef = doc(db, 'orders', order.id);
        const updatedStatus = newStatus.toLowerCase();
        await updateDoc(orderRef, { status: updatedStatus });

        // Email sending logic
        try {
          const zeptoUrl = "https://api.zeptomail.com/v1.1/email";
          const zeptoToken = import.meta.env.VITE_ZEPTO_TOKEN;
          const senderEmail = import.meta.env.VITE_EMAIL ;

          const LOGO_URL = "https://res.cloudinary.com/dkdrbjfdt/image/upload/v1749708851/icon_r1mapo.png";
          const PRIMARY_COLOR = "#7AB42C";
          const isSubscription = updatedStatus.includes("subscription") || order.isSubscriptionOrder;

          const itemsHTML = (order.cartItems || [])
            .map(
               (item) => `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eeeeee;">
               <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;" />
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #333333; font-weight: 500;">${item.name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #666666; text-align: center;">${item.no_of_items || (item as any).qty || 1}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #333333; font-weight: 600; text-align: right;">₦${Number(item.price).toLocaleString()}</td>
          </tr>
        `
            )
            .join("");
            
          const orderDate = order.created_date && typeof order.created_date === 'object' && 'seconds' in order.created_date ? new Date(order.created_date.seconds * 1000) : new Date(order.createdDate || (order as any).created_date || Date.now());

          const emailBody = `
        <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #f4f7f6; padding: 40px 20px;">
          <div style="background-color: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-top: 6px solid ${PRIMARY_COLOR};">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${LOGO_URL}" alt="My Food Angels" style="width: 120px; height: auto;" />
            </div>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #333333; font-size: 24px; margin-bottom: 10px;">Order Status Update!</h2>
              <p style="color: #666666; font-size: 16px; line-height: 1.5;">Your ${isSubscription ? "subscription" : "order"} status has been updated to: <strong style="color: ${PRIMARY_COLOR}; text-transform: capitalize;">${updatedStatus}</strong></p>
            </div>

            <div style="background-color: #f9fbf9; border: 1px solid #e1e9e1; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #888888; font-size: 14px; padding-bottom: 8px;">Order Date</td>
                  <td style="text-align: right; color: #333333; font-weight: 600; padding-bottom: 8px;">${orderDate.toLocaleDateString(undefined, { dateStyle: 'long' })}</td>
                </tr>
                <tr>
                  <td style="color: #888888; font-size: 14px; padding-bottom: 8px;">Order ID</td>
                  <td style="text-align: right; color: #333333; font-weight: 600; padding-bottom: 8px;">${order.orderId || order.id}</td>
                </tr>
                <tr>
                  <td style="color: #888888; font-size: 14px; padding-bottom: 8px;">Status</td>
                  <td style="text-align: right; color: ${PRIMARY_COLOR}; font-weight: 600; padding-bottom: 8px; text-transform: capitalize;">${updatedStatus}</td>
                </tr>
                <tr>
                   <td style="color: #888888; font-size: 14px; padding-bottom: 8px;">Shipping to</td>
                   <td style="text-align: right; color: #333333; font-weight: 600; padding-bottom: 8px;">${order.address}</td>
                </tr>
                <tr style="border-top: 1px solid #e1e9e1;">
                  <td style="color: #333333; font-size: 16px; font-weight: 700; padding-top: 12px;">Total Amount</td>
                  <td style="text-align: right; color: ${PRIMARY_COLOR}; font-weight: 800; font-size: 20px; padding-top: 12px;">₦${Number(order.totalAmount || (order as any).totalPrice || 0).toLocaleString()}</td>
                </tr>
              </table>
            </div>

            <h3 style="color: #333333; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #f4f7f6; padding-bottom: 10px;">Items in your ${isSubscription ? "Subscription" : "Order"}</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsHTML}
            </table>

            <div style="margin-top: 40px; text-align: center; border-top: 1px solid #eeeeee; padding-top: 30px;">
              <p style="color: #555555; font-size: 14px; line-height: 1.6;">If you have any questions, feel free to reply to this email. We're always happy to help!</p>
              <div style="margin-top: 20px;">
                 <a href="https://myfoodangels.com/dashboard/order-history" style="display: inline-block; background-color: ${PRIMARY_COLOR}; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 30px; font-weight: 600; font-size: 14px;">Manage Orders</a>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #999999; font-size: 12px;">
            &copy; ${new Date().getFullYear()} My Food Angels. All rights reserved.<br>
            info@myfoodangels.com
          </div>
        </div>
      `;

          if (order.email) {
            await fetch(zeptoUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Zoho-enczapikey ${zeptoToken}`,
              },
              body: JSON.stringify({
                from: {
                  address: senderEmail,
                  name: "MyFoodAngels",
                },
                to: [
                  {
                    email_address: {
                      address: order.email,
                      name: order.name || order.firstName || "Customer",
                    },
                  },
                ],
                subject: `Order Status Update: ${updatedStatus.charAt(0).toUpperCase() + updatedStatus.slice(1)} - My Food Angels`,
                htmlbody: emailBody,
              }),
            });
            console.log('Status update email sent successfully to', order.email);
          }
        } catch (err) {
          console.error('Failed to send status update email', err);
        }

        return newStatus;
      }
    },
    onSuccess: () => {
      toast.success('Order status updated successfully');
      queryClient.invalidateQueries(['get-orders']);
      queryClient.invalidateQueries(['get-single-order', orderId]);
      queryClient.invalidateQueries(['dashboard-stats']);
      setUpdating(false);
    },
    onError: (err) => {
      setUpdating(false);
      processError(err);
    },
  });

  const handleStatusChange = (value: string) => {
    setOrderStatus(value);
    updateOrderStatus.mutate(value);
  };

  console.log(order)

  return (
    <Dialog onOpenChange={(i) => setModalOpen(i)} open={modalOpen}>
      <DialogTrigger className={triggerClassName}>{trigger}</DialogTrigger>
      <DialogContent className='no-scrollbar mt-4  h-full w-full max-w-full overflow-scroll  bg-white  px-6 md:!max-w-[1000px] lg:px-[2rem]'>
        <ContentLoader isLoading={isLoading}>
          <section className='flex h-full w-full flex-col '>
            <div className='flex items-center gap-2 border-b px-4 py-4 text-[14px]  text-[#4D4D4D]'>
              <h1 className='text-[20px] font-[500]'>Order Details</h1>
              <p>•</p>
              <p>{order?.createdDate}</p>
              <p>•</p>
              <p></p>
            </div>
            <div className='my-4 grid gap-4 px-4 md:grid-cols-[2fr,1fr]'>
              <div className='grid rounded-xl border md:grid-cols-2'>
                <div>
                  <div className='p-4'>
                    <div className='mb-8'>
                      <p className='mb-2 text-[16px] leading-[24px] text-[#1A1A1A]'>
                        {order?.address}
                      </p>
                      <p className='text-[14px] text-[#666666]'>{order?.address}</p>
                    </div>
                    <div className='mb-2'>
                      <p className=' text-[12px] uppercase text-[#999999]'>Email</p>
                      <p className='break-all text-[14px] text-[#1A1A1A]'>{order?.email}</p>
                    </div>
                    <div>
                      <p className='text-[12px] uppercase text-[#999999]'>Phone</p>
                      <p className='text-[14px] text-[#1A1A1A]'>{order?.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className='rounded-xl border'>
                <div className='flex gap-4 border-b p-4'>
                  <div>
                    <p className='mb-[4px] text-[12px] uppercase text-[#999999]'>Order ID:</p>
                    <p className='text-[14px] text-[#1A1A1A]'>{order?.orderId}</p>
                  </div>
                  <div></div>
                </div>
                <div className='flex flex-col gap-6 p-4'>
                  <div className='flex justify-between text-[18px]'>
                    <p className='capitalize text-[#1A1A1A]'>Total</p>
                    <p className='font-medium text-[#2C742F]'>
                      {formatToNaira(order?.totalAmount)}
                    </p>
                  </div>
                </div>
                <div className='px-4 text-base md:py-12'>
                  <p className='capitalize text-[#1A1A1A]'>Status</p>
                  {updating ? (
                    <Spinner />
                  ) : (
                    <>
                      <div className='w-[180px]'>
                        <Select
                          onValueChange={handleStatusChange}
                          value={orderStatus}
                          defaultValue={order?.status?.toLowerCase()}
                        >
                          <SelectTrigger className='w-full text-zinc-700'>
                            <SelectValue placeholder='Select Status' className='text-zinc-700' />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value='success'>Success</SelectItem>
                            <SelectItem value='pending'>Pending</SelectItem>
                            <SelectItem value='en route'>En route</SelectItem>
                            <SelectItem value='delivered'>Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {/* <select
                      value={orderStatus}
                      onChange={handleStatusChange}
                    
                      className='mt-2 rounded border p-2'
                    >
                      <option value='Pending'>Pending</option>
                      <option value='En route'>En route</option>
                      <option value='Delivered'>Delivered</option>
                    </select> */}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* desktop */}
            <div className='hidden w-full overflow-auto px-4 md:block'>
              <Table className='w-full py-[0px]'>
                <TableHeader className='bg-[#F2F2F2]'>
                  <TableRow className='border-none px-6'>
                    {TableHeadings.map((heading, idx) => (
                      <TableHead key={idx} className='text-xs uppercase'>
                        {heading}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order?.cartItems.map((item, idx) => (
                    <TableRow className='border-none text-[#333333]' key={idx}>
                      <TableCell className='flex items-center gap-2'>
                        <img alt='product-image' src={item.image} className='h-[45px] w-[45px]' />
                        <span>{item.name}</span>
                      </TableCell>
                      <TableCell className=''>{formatToNaira(item.price)}</TableCell>
                      <TableCell>x{item.no_of_items}</TableCell>
                      <TableCell className=''>
                        {formatToNaira(item.no_of_items * item.price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* mobile */}
            <div className='px-4 md:hidden'>
              <div className='mb-8 flex flex-col gap-4'>
                {order?.cartItems.map((item, idx) => (
                  <div key={idx} className='flex items-center gap-4 rounded-xl bg-slate-100 p-4'>
                    <img alt='product-image' className='h-[80px] w-[80px]' src={item.image} />
                    <div>
                      <p className='mb-2 text-[14px] font-[500] text-[#1A1A1A]'>{item.name}</p>
                      <div className='flex items-end gap-4'>
                        <p className='text-[10px] text-[#767676]'>
                          Price:{' '}
                          <span className='text-[14px] font-[500] text-[#1A1A1A]'>
                            {formatToNaira(item.price)}
                          </span>
                        </p>
                        <p className='text-[10px] text-[#767676]'>
                          Qty:{' '}
                          <span className='text-[14px] font-[500] text-[#1A1A1A]'>
                            {item.no_of_items}
                          </span>
                        </p>
                      </div>
                      <p className='text-[10px] text-[#767676]'>
                        Sub total:{' '}
                        <span className='text-[14px] font-[500] text-[#1A1A1A]'>
                          {formatToNaira(item.no_of_items * item.price)}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ContentLoader>
      </DialogContent>
    </Dialog>
  );
};

export default ViewOrderDetailsModal;
