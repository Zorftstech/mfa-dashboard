import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { useState } from 'react';
import { cn } from 'lib/utils';
import 'react-phone-input-2/lib/style.css';
import InlineLoader from 'components/Loaders/InlineLoader';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import toast from 'helper';
import { processError } from 'helper/error';
import useStore from 'store';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, authFirebase } from 'firebase';

const FormSchema = z.object({
  fullName: z.string().min(2, {
    message: 'Please enter a valid name',
  }),
});

const AccountSettingPage = () => {

  const navigate = useNavigate();
  const { currentUser, authDetails, setAuthDetails } = useStore((state) => state);

  const [formIsLoading, setFormIsLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      fullName: authDetails?.displayName,
    },
  });



  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setFormIsLoading(true);

    try {
      const adminUserData = {
        displayName: data.fullName,
      };

      const docRef = doc(db, 'adminUsers', authDetails.uid ?? ' ');
      await setDoc(docRef, adminUserData, { merge: true });
      const user = await getDoc(docRef);
      if (user.exists()) {
        setAuthDetails({
          ...authDetails,
          ...user.data(),
        });
      }

      toast.success('Profile updated successfully');
    } catch (error) {
      processError(error);
      toast.error('An error occurred, please try again.');
    } finally {
      setFormIsLoading(false);
    }
  }

  const resetPassword = async () => {
    setFormIsLoading(true);
    try {
      const data = await sendPasswordResetEmail(authFirebase, currentUser.user?.email ?? ' ');
      toast.success('Password reset link sent successfully');
    } catch (error) {
      processError(error);
    }

    setFormIsLoading(false);
  };


  return (
    <div className='container flex h-full w-full max-w-[180.75rem] flex-col gap-6  overflow-auto px-container-base pb-[2.1rem] md:px-container-md'>
      <div className='mb-8 flex  w-full items-center justify-between gap-4 md:flex-row'>
        <div className='flex w-max cursor-pointer items-center gap-3 rounded-[8px] px-[2px]'>
          <InlineLoader isLoading={false}>
            <div className='flex flex-col  gap-1'>
              <h3 className=' text-base font-semibold lg:text-2xl'>Settings</h3>
              {/* <p className='text-[0.75rem] '>This is your user profile</p> */}
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

    
      <p className='text-lg font-semibold'>Password changes</p>
      <button
        onClick={resetPassword}
        type='button'
        className={cn(
          `group flex w-fit items-center justify-center gap-2 rounded-lg bg-primary-1 px-4 py-3 transition-all duration-300 ease-in-out hover:opacity-90 xm:px-6 xm:py-3 ${
            form.formState.isSubmitting || formIsLoading
              ? 'cursor-not-allowed bg-gray-500 font-[700]'
              : 'cursor-pointer'
          } `,
        )}
        disabled={form.formState.isSubmitting || formIsLoading}
      >
        {form.formState.isSubmitting || formIsLoading ? (
          <div className='px-5 py-1'>
            <div className='h-4 w-4 animate-spin  rounded-full border-t-4 border-white'></div>
          </div>
        ) : (
          <span className='text-sm font-[400] leading-[24px]  tracking-[0.4px] text-white '>
            Request Password Change Link
          </span>
        )}
      </button>
    
    </div>
  );
};

export default AccountSettingPage;



/**
 
  <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn(
            'flex flex-col gap-8',
            formIsLoading && 'pointer-events-none cursor-not-allowed opacity-30',
          )}
        >
          <section className=' grid grid-cols-1 gap-8 md:max-w-[40%] md:gap-6   '>
            <FormField
              control={form.control}
              name='fullName'
              render={({ field }) => (
                <FormItem>
                  <div className='relative'>
                    <label className='mb-2 inline-block rounded-full bg-white px-1 text-sm font-semibold   '>
                      Full Name
                    </label>
                    <FormControl>
                      <Input
                        className='placeholder:t rounded-[8px] py-6 text-base placeholder:text-sm'
                        {...field}
                        type='text'
                        placeholder='john doe'
                      />
                    </FormControl>
                  </div>
                  <FormMessage className='mt-1 text-sm' />
                </FormItem>
              )}
            />
            <div className='relative'>
              <label className='mb-2 inline-block rounded-full bg-white px-1 text-sm font-semibold   '>
                Email Address
              </label>
              <FormControl>
                <Input
                  className='py-6 text-base placeholder:text-sm  '
                  value={authDetails?.email}
                  type='email'
                  placeholder='sample@email.com'
                />
              </FormControl>
            </div>
          </section>

          <button
            type='submit'
            className={cn(
              `group flex w-fit items-center justify-center gap-2 rounded-lg bg-primary-1 px-4 py-3 transition-all duration-300 ease-in-out hover:opacity-90 xm:px-6 xm:py-3 ${
                form.formState.isSubmitting || formIsLoading
                  ? 'cursor-not-allowed bg-gray-500 font-[700]'
                  : 'cursor-pointer'
              } `,
            )}
            disabled={form.formState.isSubmitting || formIsLoading}
          >
            {form.formState.isSubmitting || formIsLoading ? (
              <div className='px-5 py-1'>
                <div className='h-4 w-4 animate-spin  rounded-full border-t-4 border-white'></div>
              </div>
            ) : (
              <span className='text-sm font-[400] leading-[24px]  tracking-[0.4px] text-white '>
                Save Changes
              </span>
            )}
          </button>
        </form>
      </Form>
 */