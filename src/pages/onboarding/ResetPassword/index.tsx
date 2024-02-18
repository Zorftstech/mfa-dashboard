import { LazyLoadImage } from 'react-lazy-load-image-component';
import pointingGirl from 'assets/image/pointing-girl.png?format=webp&imagetools';
import Icon from 'utils/Icon';
import { useNavigate } from 'react-router-dom';
import { Input } from 'components/shadcn/input';
import CONSTANTS from 'constant';
import InputErrorWrapper from 'components/Hocs/InputError';
import { authDetailsInterface } from 'types';
import { processError } from 'helper/error';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import customerService from 'services/customer';
import { useMutation } from '@tanstack/react-query';
import { resetPasswordFormSchema, resetPasswordInterface } from './reset.model';

import useStore from 'store';
const ResetPassword = () => {
  const navigate = useNavigate();
  const { setAuthDetails, setLoggedIn } = useStore((store) => store);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<resetPasswordInterface>({
    resolver: zodResolver(resetPasswordFormSchema),
    mode: 'all',
  });

  const { mutate, isLoading } = useMutation<authDetailsInterface, any, resetPasswordInterface>({
    mutationFn: ({ password, confirmPassword }) =>
      customerService.customerLogin({
        email: confirmPassword,
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

  const onSubmit: SubmitHandler<resetPasswordInterface> = (data) => {
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
              Reset Password
            </h5>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className='mx-auto flex w-full flex-col gap-4 '>
            <div className='relative'>
              <label className=' text-sm font-semibold text-gray-700'>Old password</label>
              <InputErrorWrapper error={errors?.password?.message}>
                <Input
                  {...register('password')}
                  className='mt-1 w-full  py-3 placeholder:text-primary-9/[0.38]'
                  // placeholder='Email'
                />
              </InputErrorWrapper>
            </div>
            <div className='relative'>
              <label className=' text-sm font-semibold text-gray-700'>New password</label>
              <InputErrorWrapper error={errors?.confirmPassword?.message}>
                <Input
                  {...register('confirmPassword')}
                  className='mt-1 w-full  py-3 placeholder:text-primary-9/[0.38]'
                  // placeholder='Email'
                />
              </InputErrorWrapper>
            </div>
            <button
              onClick={() => navigate(`/app/${CONSTANTS.ROUTES['dashboard']}`)}
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

export default ResetPassword;
