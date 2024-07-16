import { Dialog, DialogContent, DialogTrigger } from 'components/shadcn/dialog';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import CONSTANTS from 'constant';
import { StoreType } from 'store';

import useStore from 'store';
import { Units } from 'pages/app/create-new-product';
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
import { Input } from 'components/shadcn/input';
import { cn } from 'lib/utils';
interface Iprop {
  trigger: JSX.Element;
  triggerClassName?: string;
  title?: string;
  img?: string;
  desc?: string;
  units?: Units[];
  setUnits?: React.Dispatch<React.SetStateAction<Units[]>>;
  item?: any;
}
const FormSchema = z.object({
  price: z.number().min(1, {
    message: 'Please enter a valid price',
  }),

  ratio: z.number().min(1, {
    message: 'Please enter a valid ratio',
  }),

  unit: z.string().min(1, {
    message: 'Please enter a valid unit',
  }),
});

const AddUnitsModal = ({
  trigger,
  triggerClassName,
  title,
  img,
  desc,
  units,
  item,
  setUnits,
}: Iprop) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const { setEditData, setIsEditing } = useStore((state: StoreType) => state);
  const unitForm = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      price: 0,
      ratio: 1,
      unit: '',
    },
  });
  function onSubmit(data: z.infer<typeof FormSchema>) {
    setUnits?.((prev) => [...prev, data]);
    setModalOpen(false);
  }

  return (
    <Dialog onOpenChange={(i: boolean) => setModalOpen(i)} open={modalOpen}>
      <DialogTrigger className={triggerClassName}>
        <button>{trigger}</button>
      </DialogTrigger>
      <DialogContent className=' overflow-auto overflow-x-hidden bg-white     md:!max-w-[900px]'>
        <section className='flex flex-col  gap-4 px-8  '>
          <Form {...unitForm}>
            <form onSubmit={unitForm.handleSubmit(onSubmit)} className={cn('flex flex-col gap-8')}>
              <section className=' grid grid-cols-1 gap-8 md:max-w-[80%] md:gap-6   '>
                <FormField
                  control={unitForm.control}
                  name='price'
                  render={({ field }) => (
                    <FormItem>
                      <div className='relative'>
                        <label className='mb-2 inline-block rounded-full bg-white px-1 text-sm font-semibold   '>
                          Price
                        </label>
                        <FormControl>
                          <Input
                            className='placeholder:t rounded-[8px] py-6 text-base placeholder:text-sm'
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? '' : Number(value));
                            }}
                            type='number'
                            placeholder='Price'
                          />
                        </FormControl>
                      </div>
                      <FormMessage className='mt-1 text-sm' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={unitForm.control}
                  name='ratio'
                  render={({ field }) => (
                    <FormItem>
                      <div className='relative'>
                        <label className='mb-2 inline-block rounded-full bg-white px-1 text-sm font-semibold   '>
                          Ratio
                        </label>
                        <FormControl>
                          <Input
                            className='py-6 text-base placeholder:text-sm  '
                            {...field}
                            type='number'
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? '' : Number(value));
                            }}
                            placeholder='E.g 1, 0.5'
                          />
                        </FormControl>
                      </div>
                      <FormMessage className='mt-1 text-sm' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={unitForm.control}
                  name='unit'
                  render={({ field }) => (
                    <FormItem>
                      <div className='relative'>
                        <label className='mb-2 inline-block rounded-full bg-white px-1 text-sm font-semibold   '>
                          Unit of Measurement
                        </label>
                        <FormControl>
                          <Input
                            className='py-6 text-base placeholder:text-sm  '
                            {...field}
                            type='text'
                            placeholder='E.g kg, crate, basket'
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
                  `group flex w-fit items-center justify-center gap-2 rounded-lg bg-primary-1 px-3 py-2 text-sm text-white transition-all duration-300 ease-in-out hover:opacity-90`,
                )}
                disabled={unitForm.formState.isSubmitting}
              >
                Add Unit
              </button>
            </form>
          </Form>
        </section>
      </DialogContent>
    </Dialog>
  );
};

export default AddUnitsModal;
