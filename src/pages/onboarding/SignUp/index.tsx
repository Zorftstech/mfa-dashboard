import { LazyLoadImage } from 'react-lazy-load-image-component';
import rocketBoy from 'assets/image/rocketBoy.png?format=webp&w=700&h=669.86&imagetools';
import choice from 'assets/svg/choice.svg?ormat=webp&w=700&h=669.86&imagetools';
import Icon from 'utils/Icon';
import { useNavigate } from 'react-router-dom';
import { Input } from 'components/shadcn/input';
import { Label } from 'components/shadcn/label';
import { Checkbox } from 'components/shadcn/checkbox';
import CONSTANTS from 'constant';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignUpFormInterface, SignUpFormSchema } from './signUp.model';
import InputErrorWrapper from 'components/Hocs/InputError';
import { DevTool } from '@hookform/devtools';
import { useMutation } from '@tanstack/react-query';
import { processError } from 'helper/error';
import customerService from 'services/customer';
import BtnLoader from 'components/Hocs/BtnLoader';
import { customerLoginInterface } from '../Login/login.model';
import { authDetailsInterface } from 'types';
import useStore from 'store';

const SignUp = () => {
  const navigate = useNavigate();
  const { setAuthDetails, setLoggedIn } = useStore((store) => store);

  const {
    register,
    handleSubmit,
    trigger,
    control,
    formState: { errors },
  } = useForm<SignUpFormInterface>({
    resolver: zodResolver(SignUpFormSchema),
    mode: 'all',
  });

  const { mutate, isLoading } = useMutation<authDetailsInterface, any, SignUpFormInterface>({
    mutationFn: ({ first_name, last_name, email, password }) =>
      customerService.createCustomer({
        first_name,
        last_name,
        email,
        organization_id: import.meta.env.VITE_TIMBU_ORG_ID,
        contact_infos: [
          {
            contact_data: `${email}`,
            contact_type: 'email',
          },
        ],
        password,
      }),
    onSuccess: (_, variables) => {
      doLoginAttempt({
        email: `${variables?.email}`,
        app_url: `${import.meta.env.VITE_BASE_URL}/login?email=${variables?.email}`,
        organization_id: import.meta.env.VITE_TIMBU_ORG_ID,
        password: `${variables?.password}`,
      });
    },
    onError: (err) => {
      processError(err);
    },
  });

  const { mutate: doLoginAttempt } = useMutation<any, any, customerLoginInterface>({
    mutationFn: (params) =>
      customerService.customerLogin({
        ...params,
      }),
    onSuccess: (data) => {
      setAuthDetails(data);
      setLoggedIn(true);
    },
    onError: (err) => {
      processError(err);
    },
  });

  const onSubmit: SubmitHandler<SignUpFormInterface> = (data) => {
    mutate(data);
  };

  return (
    <div className='flex h-full w-full items-center justify-center bg-secondary-1'>
      <div className=' mx-auto flex w-full  flex-col items-center justify-center gap-4  px-4 md:max-w-xl md:px-[3rem]'>
        <div className='flex w-full flex-col items-center gap-2'>
          <div className=' flex cursor-pointer items-center' onClick={() => navigate(`/`)}>
            <Icon name='nfmLogo' svgProp={{ className: 'w-[8rem] h-[5rem]' }} />
          </div>

          <h5 className='tracking-[0.18px]] font-inter text-[17px] font-[600] leading-[32px]'>
            Create an Account
          </h5>
        </div>

        <section className='w-full  rounded-lg bg-white p-8 px-8 shadow-sm'>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='mx-auto flex w-full flex-col items-start justify-center'
          >
            <div className='mb-[1.25rem] flex w-full flex-col gap-4'>
              <InputErrorWrapper error={errors?.first_name?.message}>
                <Input
                  {...register('first_name')}
                  className='w-full placeholder:text-xs placeholder:text-primary-9/[0.38]'
                  placeholder='First name'
                />
              </InputErrorWrapper>
              <InputErrorWrapper error={errors?.last_name?.message}>
                <Input
                  {...register('last_name')}
                  className='w-full placeholder:text-xs placeholder:text-primary-9/[0.38]'
                  placeholder='Last name'
                />
              </InputErrorWrapper>
              <InputErrorWrapper error={errors?.email?.message}>
                <Input
                  {...register('email')}
                  className='w-full placeholder:text-xs placeholder:text-primary-9/[0.38]'
                  placeholder='Email'
                />
              </InputErrorWrapper>
              <InputErrorWrapper error={errors?.password?.message}>
                <Input
                  {...register('password')}
                  className='w-full !border-slate-200 !ring-0 placeholder:text-xs placeholder:text-primary-9/[0.38]'
                  placeholder='Password'
                  type='password'
                />
              </InputErrorWrapper>
              {/* <Input className='w-full placeholder:text-primary-9/[0.38]' placeholder='Password' /> */}
            </div>

            <button
              onClick={() => trigger()}
              type='submit'
              className=' w-full rounded-[8px] bg-primary-1 py-2 text-xs font-[500] text-white shadow-3 transition-opacity duration-300 ease-in-out hover:opacity-90'
            >
              <BtnLoader isLoading={isLoading}>
                <span className='leading-[0.46px]'>Sign Up</span>
              </BtnLoader>
            </button>
          </form>
        </section>

        <DevTool control={control} />
        <p className='mx-auto mb-8 text-center text-xs leading-[24px] tracking-[0.15px] text-primary-9/[0.87]'>
          Already have an account?
          <span
            className='cursor-pointer text-primary-1 hover:underline'
            onClick={() => navigate(`/${CONSTANTS.ROUTES['login']}`)}
          >
            {' '}
            Sign in instead
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
