import { LazyLoadImage } from 'react-lazy-load-image-component';
import sittingBoy from 'assets/image/sitting-boy.png?format=webp&imagetools';
import Icon from 'utils/Icon';
import { useNavigate } from 'react-router-dom';
import { Input } from 'components/shadcn/input';
import CONSTANTS from 'constant';

const ResetPassword = () => {
  const navigate = useNavigate();
  return (
    <div className='flex h-full w-full items-center'>
      <div className='mx-auto w-full bg-white px-4 md:max-w-[calc(96px+494px)] md:px-[3rem]'>
        <div className='mx-auto flex w-full flex-col items-start justify-center'>
          <div
            className='mb-[2.125rem] flex cursor-pointer items-center'
            onClick={() => navigate(`/`)}
          >
            <Icon name='nfmLogo' svgProp={{ width: 40, height: 40 }} />
          </div>
          <div className='mb-[1.5rem] flex w-full flex-col'>
            <h5 className='font-inter text-[24px] font-[700] leading-[32px] tracking-[0.18px] text-primary-9/[0.87]'>
              Reset Password 🔒
            </h5>
            <p className='leading-[24px] tracking-[0.15px] text-primary-9/[0.60]'>
              Your new password must be different from previously used passwords
            </p>
          </div>
          <div className='mb-[1.25rem] flex w-full flex-col gap-4'>
            <Input
              className='w-full placeholder:text-primary-9/[0.38]'
              placeholder='new password'
            />
            <Input
              className='w-full placeholder:text-primary-9/[0.38]'
              placeholder='confirm password'
            />
            <button
              onClick={() => navigate(`/${CONSTANTS.ROUTES['login']}`)}
              className='mb-[1.75rem] w-full rounded-[8px] bg-primary-1 py-2 text-[15px] font-[500] text-white shadow-3 transition-opacity duration-300 ease-in-out hover:opacity-90'
            >
              <span className='leading-[0.46px]'>SUBMIT</span>
            </button>
            <button
              onClick={() => navigate(`/${CONSTANTS.ROUTES['login']}`)}
              className='flex cursor-pointer items-center gap-1 place-self-center text-[14px] leading-[21px] tracking-[0.15px] text-primary-1 hover:underline'
            >
              <Icon name='arrowBackTailess' svgProp={{ width: 14 }} />
              <span> Back to login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
