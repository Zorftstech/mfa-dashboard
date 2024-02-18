import { LazyLoadImage } from 'react-lazy-load-image-component';
import pointingGirl from 'assets/image/pointing-girl.png?format=webp&imagetools';
import Icon from 'utils/Icon';
import { useNavigate } from 'react-router-dom';
import { Input } from 'components/shadcn/input';
import CONSTANTS from 'constant';
import InputErrorWrapper from 'components/Hocs/InputError';
import { customerLoginFormInterface, customerLoginFormSchema } from '../Login/login.model';
import { authDetailsInterface } from 'types';
import { processError } from 'helper/error';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import customerService from 'services/customer';
import { useMutation } from '@tanstack/react-query';

import useStore from 'store';
const ForgotPassword = () => {
  const navigate = useNavigate();
  const { setAuthDetails, setLoggedIn } = useStore((store) => store);

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

  return (
    <div className='flex h-full w-full items-center'>
      <div className='mx-auto w-full bg-white px-4 md:max-w-[calc(96px+494px)] md:px-[3rem]'>
        <div className='mx-auto flex w-full flex-col items-start justify-center'>
          <div className='flex w-full flex-col items-center'>
            <div className=' flex cursor-pointer items-center' onClick={() => navigate(`/`)}>
              <Icon name='nfmLogo' svgProp={{ className: 'w-[6rem] h-[4rem]' }} />
            </div>

            <h5 className='tracking-[0.18px]] font-inter text-[20px] font-[600] leading-[32px]'>
              Forgot Password?
            </h5>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className='mx-auto flex w-full flex-col gap-4 '>
            <div className='relative'>
              <label className=' text-sm font-semibold text-gray-700'>Email Address</label>
              <InputErrorWrapper error={errors?.email?.message}>
                <Input
                  {...register('email')}
                  className='mt-1 w-full  py-3 placeholder:text-primary-9/[0.38]'
                  // placeholder='Email'
                />
              </InputErrorWrapper>
            </div>
            <button
              onClick={() => navigate(`/${CONSTANTS.ROUTES['reset-password']}?key=forgot-password`)}
              className='mb-[1.75rem] w-full rounded-[8px] bg-primary-1 py-2 text-[15px] font-[500] text-white shadow-3 transition-opacity duration-300 ease-in-out hover:opacity-90'
            >
              <span className='leading-[0.46px]'>Reset Password</span>
            </button>
            <button
              onClick={() => navigate(`/${CONSTANTS.ROUTES['login']}`)}
              className='flex cursor-pointer items-center gap-1 place-self-center text-[14px] leading-[21px] tracking-[0.15px] text-primary-1 hover:underline'
            >
              <Icon name='arrowBackTailess' svgProp={{ width: 14 }} />
              <span> Back to login</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
