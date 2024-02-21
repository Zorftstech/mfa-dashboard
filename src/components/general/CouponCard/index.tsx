import CONSTANTS from 'constant';
import { Star, StarHalf, Clipboard, Copy } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useNavigate } from 'react-router-dom';
import { shimmer, toBase64 } from 'utils/general/shimmer';
import { copyToClipboard } from 'helper';

interface ICouponCard {
  purpose: string;
  date: string | number;
  name: string;
  link?: string;
  discount: string | number;
}

const CouponCard = ({
  purpose,
  discount,
  date,
  name,
  link = `/${CONSTANTS.ROUTES.blogs}/test-blog`,
}: ICouponCard) => {
  const navigate = useNavigate();

  return (
    <div className='group  flex h-max w-full cursor-pointer flex-col items-center justify-between gap-4 rounded-2xl bg-primary-10 px-4 py-4  shadow-md transition-all duration-300 ease-in-out'>
      <div>
        <p className='text-center text-[0.9rem] leading-[27px] '>{purpose}</p>
        <p className='text-center text-[0.85rem] font-[300] leading-[27px] '>
          {`${discount}%`} discount
        </p>
      </div>
      <div>
        <h5
          onClick={() => {
            copyToClipboard(name, 'Coupon code copied to clipboard');
          }}
          className='flex gap-2 text-center text-[1.1rem] font-[600] leading-[27px] text-primary-1 '
        >
          {name}
          <span>
            <Copy size={17} className='text-black' />
          </span>
        </h5>
        <p className='text-center text-[0.6rem]  leading-[21px] tracking-[0.1px]  '>
          Valid till {date}
        </p>
      </div>

      <button
        onClick={() => {
          navigate(`/app/${CONSTANTS.ROUTES['create-coupon']}?edit=true&category=${name}`);
        }}
        className='group flex w-full items-center justify-center gap-2 rounded-[8px] border border-primary-1   px-8   py-2 text-base font-semibold transition-all duration-300 ease-in-out hover:opacity-90'
      >
        <span className='text-sm font-[500] leading-[24px] tracking-[0.4px] text-primary-1  '>
          Edit
        </span>
      </button>
    </div>
  );
};

export default CouponCard;
