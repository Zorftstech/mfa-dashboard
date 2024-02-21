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
import { ChevronLeft, ChevronRightIcon } from 'lucide-react';
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
import toast from 'helper';
import Spinner from 'components/shadcn/ui/spinner';
import { processError } from 'helper/error';
import CONSTANTS from 'constant';
import { Switch } from 'components/shadcn/switch';

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
  productName: z.string().min(2, {
    message: 'Please enter a valid name',
  }),

  price: z.string().min(2, {
    message: 'Please enter a valid price',
  }),
  category: z.string().min(2, {
    message: 'Please enter a valid category',
  }),
  description: z.string().min(1, {
    message: 'Please enter a valid description',
  }),
  unit: z.string({
    required_error: 'unit is required.',
  }),
  quantity: z.string({
    required_error: 'quantity is required.',
  }),

  minimumPrice: z.string().min(2, {
    message: 'Please enter a valid minimum price',
  }),
  nameYourPrice: z.boolean().default(false).optional(),
});
const CreateCategory = () => {
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
    // switchTab(tabData[3]);

    console.log(data);

    setFormIsLoading(true);

    try {
      toast.success('Patient Created Successfully');
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
              <h3 className=' text-base font-semibold md:text-xl'>Add Category</h3>
              <p className='text-[0.75rem] '>This will add a new category to your catalogue</p>
            </div>
          </InlineLoader>
        </div>

        <div className='flex  gap-4'>
          <button
            // onClick={() => form.trigger()}
            disabled={formIsLoading}
            onClick={() => form.handleSubmit(onSubmit)()}
            className='group flex  items-center justify-center gap-2  rounded-[5px] bg-primary-1 px-8 py-2 text-base font-semibold text-white transition-all duration-300 ease-in-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {formIsLoading ? (
              <Spinner />
            ) : (
              <span className='text-xs font-[500] leading-[24px] tracking-[0.4px] text-white md:text-sm'>
                Create Category
              </span>
            )}
          </button>

          {/* <SavePatientModal
            trigger={
              <button className='group flex  items-center justify-center gap-2  rounded-[5px] bg-primary-1 px-8 py-2 text-base font-semibold text-white transition-all duration-300 ease-in-out hover:opacity-90'>
                <span className='text-xs font-[500] leading-[24px] tracking-[0.4px] text-white md:text-sm'>
                  Create Product
                </span>
              </button>
            }
          ></SavePatientModal> */}

          <button className='group flex  items-center justify-center gap-2  rounded-[5px] border   px-5 text-base font-semibold transition-all duration-300 ease-in-out hover:opacity-90'>
            <span className='text-xs font-[500] leading-[24px] tracking-[0.4px]  md:text-sm'>
              Cancel
            </span>
          </button>
        </div>
      </div>
      <div className='flex items-end justify-between'>
        <UploadImageForm />
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
              name='productName'
              render={({ field }) => (
                <FormItem>
                  <div className='relative'>
                    <label className='mb-2 inline-block rounded-full bg-white px-1 text-sm font-semibold   '>
                      Product Name
                    </label>
                    <FormControl>
                      <Input
                        className='placeholder:t rounded-[8px] py-6 text-base placeholder:text-sm'
                        {...field}
                        type='text'
                        placeholder='Enter product name'
                      />
                    </FormControl>
                  </div>
                  <FormMessage className='mt-1 text-sm' />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='price'
              render={({ field }) => (
                <FormItem>
                  <div className='relative'>
                    <label className='mb-2 inline-block rounded-full bg-white px-1 text-sm font-semibold   '>
                      Price (NGN)
                    </label>
                    <FormControl>
                      <Input
                        className='py-6 text-base placeholder:text-sm  '
                        {...field}
                        type='text'
                        placeholder='3000'
                      />
                    </FormControl>
                  </div>
                  <FormMessage className='mt-1 text-sm' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem>
                  <div className='relative'>
                    <label className='mb-2 inline-block rounded-full bg-white px-1 text-sm font-semibold   '>
                      Category
                    </label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className='w-full py-6 text-sm  text-secondary-3 transition-all duration-300  ease-in-out  placeholder:text-lg focus-within:text-secondary-2 '>
                          <SelectValue placeholder='Select product categories' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='bg-primary-1'>
                        <SelectItem value='grains' className='py-3 text-sm text-white'>
                          Grains
                        </SelectItem>
                        <SelectItem value='vegetables' className='py-3 text-sm text-white'>
                          Vegetables
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage className='mt-1 text-xs' />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <div className='relative'>
                    <label className='mb-2 inline-block rounded-full bg-white px-1 text-sm font-semibold   '>
                      Description
                    </label>
                    <FormControl>
                      <Input
                        className='py-6 text-base placeholder:text-sm  '
                        {...field}
                        type='text'
                        placeholder='Enter product description'
                      />
                    </FormControl>
                  </div>
                  <FormMessage className='mt-1 text-sm' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='unit'
              render={({ field }) => (
                <FormItem>
                  <div className='relative'>
                    <label className='mb-2 inline-block rounded-full bg-white px-1 text-sm font-semibold   '>
                      Unit
                    </label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className='w-full py-6 text-sm  text-secondary-3 transition-all duration-300  ease-in-out  placeholder:text-lg focus-within:text-secondary-2 '>
                          <SelectValue placeholder='Select a unit of measurement' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='bg-primary-1'>
                        <SelectItem value='kg' className='py-3 text-sm text-white'>
                          kg
                        </SelectItem>
                        <SelectItem value='g' className='py-3 text-sm text-white'>
                          g
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage className='mt-1 text-xs' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='quantity'
              render={({ field }) => (
                <FormItem>
                  <div className='relative'>
                    <label className='mb-2 inline-block rounded-full bg-white px-1 text-sm font-semibold   '>
                      Quantity
                    </label>
                    <FormControl>
                      <Input
                        className='py-6 text-base placeholder:text-sm placeholder:text-secondary-1/50 '
                        {...field}
                        type='text'
                      />
                    </FormControl>
                  </div>
                  <FormMessage className='mt-1 text-sm' />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='nameYourPrice'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg  p-3 shadow-sm'>
                  <div className=''>
                    <FormLabel className='font-semibold text-black'>Name your price</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='minimumPrice'
              render={({ field }) => (
                <FormItem>
                  <div className='relative'>
                    <label className='mb-2 inline-block rounded-full bg-white px-1 text-sm font-semibold   '>
                      Minimum Price (NGN)
                    </label>
                    <FormControl>
                      <Input
                        className='py-6 text-base placeholder:text-sm  '
                        {...field}
                        type='text'
                        placeholder='Set minimum price'
                      />
                    </FormControl>
                  </div>
                  <FormMessage className='mt-1 text-sm' />
                </FormItem>
              )}
            />
          </section>

          <p className='invisible'>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus quam nulla illo
            dolore? Voluptatibus in blanditiis deleniti quasi a ex culpa quae, aliquid, dolores
            unde, corrupti iusto. Asperiores ipsa dignissimos temporibus error possimus. Asperiores,
            eos!
          </p>

          {/* <div className='flex  w-full items-center justify-center gap-4'>
            <button
              type='submit'
              
              className={cn(
                `group mt-9 flex items-center justify-center gap-2 rounded-full bg-primary-1 px-8 py-3 transition-all duration-300 ease-in-out hover:opacity-90 xm:px-12 xm:py-4 ${
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
                <span className='text-sm font-[600] leading-[24px]  tracking-[0.4px] text-white xm:text-base'>
                  Continue to shipping
                </span>
              )}
            </button>
          </div> */}
        </form>
      </Form>
    </div>
  );
};

export default CreateCategory;
