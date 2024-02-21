import CONSTANTS from 'constant';
import { Star, StarHalf } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useNavigate } from 'react-router-dom';
import { shimmer, toBase64 } from 'utils/general/shimmer';

interface ICouponCard {
  img: string;
  price: string | number;
  name: string;
  link?: string;
  rating: string | number;
}

const CouponCard = ({
  img,
  price,
  name,
  link = `/${CONSTANTS.ROUTES.blogs}/test-blog`,
}: ICouponCard) => {
  const navigate = useNavigate();

  return (
    <div
      // onClick={() => navigate(link)}
      className='group flex h-max w-full cursor-pointer flex-col justify-between rounded-2xl bg-slate-50 px-4 py-4 shadow-md  transition-all duration-300 ease-in-out'
    >
      <div className='flex flex-col gap-2'>
        <div className='flex  w-full flex-col gap-1  '>
          <h5 className='  text-[0.9rem] font-medium leading-[27px] text-primary-8'>{name}</h5>

          <p className='text-[14px] font-[600] leading-[21px] tracking-[0.1px] text-primary-1 '>
            {price}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CouponCard;
