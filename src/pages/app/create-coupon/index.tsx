import { TabsContent } from 'components/shadcn/ui/tabs';
import { Button } from 'components/shadcn/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormDescription,
  FormLabel,
} from 'components/shadcn/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'components/shadcn/ui/select';
import { Input } from 'components/shadcn/input';
import axiosInstance from 'services';
import { ChevronLeft, ChevronRightIcon, CalendarIcon } from 'lucide-react';
import React, { useState } from 'react';
import { CountryDropdown, RegionDropdown, CountryRegionData } from 'react-country-region-selector';
import { cn } from 'lib/utils';
import { Checkbox } from 'components/shadcn/ui/checkbox';
import 'react-phone-input-2/lib/style.css';
import InlineLoader from 'components/Loaders/InlineLoader';
import useUserLocation from 'hooks/useUserLoction';
import { useEffect } from 'react';
import Icon from 'utils/Icon';
import { useNavigate } from 'react-router-dom';
import UploadImageForm from './UploadForm';
import SavePatientModal from 'components/modal/Patients/SavePatient';
import LinkPatientsModal from 'components/modal/Patients/LinkPatient';
import PI, { PhoneInputProps } from 'react-phone-input-2';
import API from 'services';
import toast, { generateCouponCode } from 'helper';
import Spinner from 'components/shadcn/ui/spinner';
import { processError } from 'helper/error';
import CONSTANTS from 'constant';
import { Switch } from 'components/shadcn/switch';
import { Popover, PopoverContent, PopoverTrigger } from 'components/shadcn/popover';
import { Calendar } from 'components/shadcn/ui/calendar';
import { format } from 'date-fns';
import { collection, addDoc } from 'firebase/firestore';
import { db } from 'firebase';

// fix for phone input build error
const PhoneInput: React.FC<PhoneInputProps> = (PI as any).default || PI;
interface Iprops {
  switchTab: (tab: string) => void;
  handleComplete: (tab: string) => void;
  data: string[];
  userInfo: any; // change to the right type
  handleUserInfo: (info: any) => void; // change to the right type
}
interface ErrorMessages {
  [key: string]: string[];
}

const FormSchema = z.object({
  couponName: z.string().min(2, {
    message: 'Please enter a valid name',
  }),

  purpose: z.string().min(2, {
    message: 'Please enter a valid purpose',
  }),
  dateToExpire: z.date({
    required_error: 'A date of birth is required.',
  }),

  discount: z.string().min(1, {
    message: 'Please enter a valid discount',
  }),
});
const CreateCoupon = () => {
  const { location } = useUserLocation();
  const navigate = useNavigate();

  const [formIsLoading, setFormIsLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function extractErrorMessages(errors: ErrorMessages): string[] {
    let messages: string[] = [];
    for (const key of Object.keys(errors)) {
      if (Object.prototype.hasOwnProperty.call(errors, key)) {
        messages = messages.concat(errors[key]);
      }
    }
    return messages;
  }
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setFormIsLoading(true);

    try {
      // Example usage
      const couponData = {
        code: generateCouponCode(data.couponName).slice(0, 15),
        discountType: 'percentage',
        discountAmount: data.discount,
        expirationDate: data.dateToExpire,
        minSpend: 50,
        applicableProducts: [],
        applicableCategories: [],
        oneTimeUse: true,
        isActive: true,
        purpose: data.purpose,
        name: data.couponName,
      };
      const docRef = await addDoc(collection(db, 'couponCodes'), {
        code: couponData.code,
        discountType: couponData.discountType,
        discountAmount: couponData.discountAmount,
        expirationDate: couponData.expirationDate, // Make sure this is a Firestore Timestamp
        minSpend: couponData.minSpend || null, // Optional field
        applicableProducts: couponData.applicableProducts || [], // Optional field
        applicableCategories: couponData.applicableCategories || [], // Optional field
        oneTimeUse: couponData.oneTimeUse,
        isActive: couponData.isActive,
        name: couponData.name,
        purpose: couponData.purpose,
      });

      toast.success('Coupon Created Successfully');
    } catch (error: any) {
      processError(error);
      extractErrorMessages(error?.response?.data).forEach((err) => {
        toast.error(err);
      });
    }
    setFormIsLoading(false);
  }

  return (
    <div className='container flex h-full w-full max-w-[180.75rem] flex-col gap-8  px-container-md pb-[2.1rem]'>
      <div className='mb-8 flex  w-full items-center justify-between gap-4 md:flex-row'>
        <div className='flex w-max cursor-pointer items-center gap-3 rounded-[8px] px-[2px]'>
          <button onClick={() => navigate(-1)}>
            <ChevronLeft className='h-6 w-6 font-light' />
          </button>

          <InlineLoader isLoading={false}>
            <div className='flex flex-col  gap-1'>
              <h3 className=' text-base font-semibold md:text-xl'>Coupon creation</h3>
              <p className='text-[0.75rem] '>This will add a new coupon to your catalogue</p>
            </div>
          </InlineLoader>
        </div>

        <div className='flex  gap-4'>
          <button
            onClick={() => navigate(-1)}
            className='group flex items-center justify-center gap-2 rounded-[5px] border   px-8   py-2 text-base font-semibold transition-all duration-300 ease-in-out hover:opacity-90'
          >
            <span className='text-xs font-[500] leading-[24px] tracking-[0.4px]  md:text-sm'>
              Cancel
            </span>
          </button>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn(
            'flex flex-col gap-8',
            formIsLoading && 'pointer-events-none cursor-not-allowed opacity-30',
          )}
        >
          <section className=' grid grid-cols-1 gap-8 md:max-w-[80%] md:gap-6 xm:grid-cols-[1fr_1fr]  '>
            <FormField
              control={form.control}
              name='couponName'
              render={({ field }) => (
                <FormItem>
                  <div className='relative'>
                    <label className='mb-2 inline-block rounded-full bg-white px-1 text-sm font-semibold   '>
                      Coupon Name
                    </label>
                    <FormControl>
                      <Input
                        className='placeholder:t rounded-[8px] py-6 text-base placeholder:text-sm'
                        {...field}
                        type='text'
                        placeholder='Enter coupon name'
                      />
                    </FormControl>
                  </div>
                  <FormMessage className='mt-1 text-sm' />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='purpose'
              render={({ field }) => (
                <FormItem>
                  <div className='relative'>
                    <label className='mb-2 inline-block rounded-full bg-white px-1 text-sm font-semibold   '>
                      Coupon purpose
                    </label>
                    <FormControl>
                      <Input
                        className='py-6 text-base placeholder:text-sm  '
                        {...field}
                        type='text'
                        placeholder='Reason for coupon creation'
                      />
                    </FormControl>
                  </div>
                  <FormMessage className='mt-1 text-sm' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='dateToExpire'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel className=' inline-block rounded-full bg-white px-1 text-sm font-semibold   '>
                    Expiry date
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full py-6 pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Set a date</span>}
                          <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-full p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={field.value}
                        onSelect={field.onChange}
                        // disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='discount'
              render={({ field }) => (
                <FormItem>
                  <div className='relative'>
                    <label className='mb-2 inline-block rounded-full bg-white px-1 text-sm font-semibold   '>
                      Coupon discount (%)
                    </label>
                    <FormControl>
                      <Input
                        className='py-6 text-base placeholder:text-sm  '
                        {...field}
                        type='text'
                        placeholder='3'
                      />
                    </FormControl>
                  </div>
                  <FormMessage className='mt-1 text-sm' />
                </FormItem>
              )}
            />
          </section>
          <button
            type='submit'
            className={cn(
              `group flex w-fit items-center justify-center gap-2 rounded-lg bg-primary-1 px-4 py-3 transition-all duration-300 ease-in-out hover:opacity-90 xm:px-6 xm:py-3 ${
                form.formState.isSubmitting
                  ? 'cursor-not-allowed bg-gray-500 font-[700]'
                  : 'cursor-pointer'
              } `,
            )}
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <div className='px-5 py-1'>
                <div className='h-4 w-4 animate-spin  rounded-full border-t-4 border-white'></div>
              </div>
            ) : (
              <span className='text-sm font-[400] leading-[24px]  tracking-[0.4px] text-white '>
                Generate coupon code
              </span>
            )}
          </button>
          <p className='invisible'>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus quam nulla illo
            dolore? Voluptatibus in blanditiis deleniti quasi a ex culpa quae, aliquid, dolores
            unde, corrupti iusto. Asperiores ipsa dignissimos temporibus error possimus. Asperiores,
            eos!
          </p>
        </form>
      </Form>
    </div>
  );
};

export default CreateCoupon;
