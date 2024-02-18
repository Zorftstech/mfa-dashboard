import { LazyLoadImage } from 'react-lazy-load-image-component';
import rocketBoy from 'assets/image/rocketBoy.png?format=webp&w=700&h=669.86&imagetools';
import loginIcon from 'assets/svg/login.svg?format=webp&w=700&h=669.86&imagetools';
import Icon from 'utils/Icon';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from 'components/shadcn/input';
import { Label } from 'components/shadcn/label';
import { Checkbox } from 'components/shadcn/checkbox';
import CONSTANTS from 'constant';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from 'components/shadcn/dialog';
import { useMutation } from '@tanstack/react-query';
import customerService from 'services/customer';
import { customerLoginFormInterface, customerLoginFormSchema } from './login.model';
import { processError } from 'helper/error';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import InputErrorWrapper from 'components/Hocs/InputError';
import BtnLoader from 'components/Hocs/BtnLoader';
import { authDetailsInterface } from 'types';
import useStore from 'store';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
  FormDescription,
} from 'components/shadcn/ui/form';
import { EyeOff, Eye } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [emailVerifiedOpen, setEmailVerifiedOpen] = useState(false);
  const { setAuthDetails, setLoggedIn } = useStore((store) => store);
  const [showPassword, setShowPassword] = useState(false);
  const [params] = useSearchParams();
  const [checked, setChecked] = useState(false);

  const email_verfied = params.get('email');

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<customerLoginFormInterface>({
    resolver: zodResolver(customerLoginFormSchema),
    mode: 'all',
  });

  const { mutate, isLoading } = useMutation<authDetailsInterface, any, customerLoginFormInterface>({
    mutationFn: ({ email, password }) =>
      customerService.customerLogin({
        email,
        password,
      }),
    onSuccess: (data) => {
      setAuthDetails(data);
      setLoggedIn(true);
      navigate(`/app/${CONSTANTS.ROUTES['dashboard']}`);
    },
    onError: (err) => {
      processError(err);
    },
  });

  const onSubmit: SubmitHandler<customerLoginFormInterface> = (data) => {
    mutate(data);
  };

  useEffect(() => {
    if (email_verfied) {
      setEmailVerifiedOpen(true);
    }
  }, []);

  return (
    <div className=' flex h-full w-full items-center justify-center'>
      <Dialog open={emailVerifiedOpen} onOpenChange={setEmailVerifiedOpen}>
        <DialogContent className='h-screen !max-w-[1120px] bg-white sm:h-max sm:w-[80vw] lg:w-[50vw]'>
          <div className='mx-auto flex h-full w-full flex-col gap-[1.5rem] pb-[5.31rem] pt-[6.56rem]  md:max-w-[30rem]'>
            <div
              className='mb-[2.125rem] flex cursor-pointer items-center'
              onClick={() => navigate(`/`)}
            >
              <Icon name='nfmLogo' svgProp={{ width: 40, height: 40 }} />
              <h4 className='whitespace-nowrap text-[22px] font-[700]   leading-[24px] tracking-[0.15px] text-primary-9/[0.87] md:text-[28px]'>
                Nollywood Filmmaker.com
              </h4>
            </div>
            <div className='mb-[1.5rem] flex w-full flex-col'>
              <h5 className='font-inter text-[24px] font-[700] leading-[32px] tracking-[0.18px] text-primary-9/[0.87]'>
                Email Verified ✉️
              </h5>
              <p className='leading-[24px] tracking-[0.15px] text-primary-9/[0.60]'>
                Your email hase been verified, you can now continue to login.
              </p>
            </div>
            <button
              onClick={() => setEmailVerifiedOpen(false)}
              className='mb-[1.75rem] w-full rounded-[8px] bg-primary-1 py-2 text-[15px] font-[500] text-white shadow-3 transition-opacity duration-300 ease-in-out hover:opacity-90'
            >
              <span className='leading-[0.46px]'>Continue</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <div className=' mx-auto flex   w-full flex-col items-center justify-center  bg-white px-4 md:max-w-xl md:px-[3rem]  '>
        <div className='flex w-full flex-col items-center'>
          <div className=' flex cursor-pointer items-center' onClick={() => navigate(`/`)}>
            <Icon name='nfmLogo' svgProp={{ className: 'w-[6rem] h-[4rem]' }} />
          </div>

          <h5 className='tracking-[0.18px]] font-inter text-[20px] font-[600] leading-[32px]'>
            Log in to your account{' '}
          </h5>
        </div>
        <section className='w-full rounded-lg border p-8 pt-10'>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='mx-auto flex w-full flex-col items-start justify-center'
          >
            <div className='mb-[1.25rem] flex w-full flex-col gap-4'>
              <div className='relative'>
                <label className=' text-sm font-semibold text-gray-700'>Username</label>
                <InputErrorWrapper error={errors?.email?.message}>
                  <Input
                    {...register('email')}
                    className='mt-1 w-full  py-3 placeholder:text-primary-9/[0.38]'
                    // placeholder='Email'
                  />
                </InputErrorWrapper>
              </div>
              <div className='relative'>
                <label className=' text-sm font-semibold text-gray-700'>Password</label>

                <InputErrorWrapper error={errors?.password?.message}>
                  <div className='flex items-center gap-4 rounded-lg border p-1   pr-4'>
                    <Input
                      {...register('password')}
                      className=' h-2/3 w-full rounded-r-none border-0 text-[0.8rem]  placeholder:text-[0.8rem]   '
                      placeholder='Password'
                      type={showPassword ? '' : 'password'}
                    ></Input>
                    {showPassword ? (
                      <button onClick={() => setShowPassword(false)} type='button'>
                        <EyeOff className='h-full  w-5  text-gray-400' />
                      </button>
                    ) : (
                      <button onClick={() => setShowPassword(true)} type='button'>
                        <Eye className='h-full w-5 text-gray-400' />
                      </button>
                    )}
                  </div>
                </InputErrorWrapper>
              </div>
              <div className='my-4 flex w-full items-center justify-between gap-[0.75rem]'>
                <div className='flex items-center gap-2 '>
                  <Checkbox
                    checked={checked}
                    onClick={() => setChecked(!checked)}
                    className='rounded-sm border-gray-300  checked:!bg-primary-1 checked:!text-black data-[state=checked]:bg-primary-1 data-[state=checked]:!text-white'
                    id='Remember Me'
                  />
                  <Label
                    htmlFor='Remember Me'
                    className=' text-[0.7rem] leading-[21px] tracking-[0.15px] text-gray-600'
                  >
                    Remember Me
                  </Label>
                </div>
                <button
                  disabled={isLoading}
                  type='button'
                  onClick={() => navigate(`/${CONSTANTS.ROUTES['forgot-password']}`)}
                  className='cursor-pointe  text-[12px] leading-[21px] tracking-[0.15px] text-primary-3  hover:underline'
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              onClick={() => navigate('/app/dashboard')}
              disabled={isLoading}
              className='mb-[1.75rem] w-full rounded-[8px] bg-primary-1 py-2 text-[15px] font-[500] text-white shadow-3 transition-opacity duration-300 ease-in-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <BtnLoader isLoading={isLoading}>
                <span className='leading-[0.46px]'>Sign in</span>
              </BtnLoader>
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Login;
