import { Dialog, DialogContent, DialogTrigger } from 'components/shadcn/dialog';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import CONSTANTS from 'constant';
interface Iprop {
  trigger: JSX.Element;
  triggerClassName?: string;
  title?: string;
  img?: string;
  desc?: string;
}

const CategoryModal = ({ trigger, triggerClassName, title, img, desc }: Iprop) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  return (
    <Dialog onOpenChange={(i: boolean) => setModalOpen(i)} open={modalOpen}>
      <DialogTrigger className={triggerClassName}>
        <button>{trigger}</button>
      </DialogTrigger>
      <DialogContent className=' w-fit overflow-auto overflow-x-hidden bg-white     md:!max-w-[500px]'>
        <section className='flex flex-col  gap-4 px-8  '>
          <img
            src={img}
            className='w-full rounded-md object-cover object-center md:h-[10rem]'
            alt=''
          />
          <h4 className='  text-[0.7rem] font-[600]  tracking-[0.02rem] transition-all duration-500 ease-in-out md:text-[1rem]  md:tracking-[0.0225rem]'>
            {title}
          </h4>

          <h2 className=' text-[0.7rem] font-[400] leading-[1.2rem] '>{desc}</h2>
          <p className='text-[0.65rem]'>
            <span className='font-bold'>Sub-categories:</span> meat, poultry, fish, seafood
          </p>

          <button
            onClick={() => {
              navigate(`/app/${CONSTANTS.ROUTES['create-category']}?edit=true&category=${title}`);
            }}
            className='group flex items-center justify-center gap-2 rounded-[5px] border border-primary-1   px-8   py-2 text-base font-semibold transition-all duration-300 ease-in-out hover:opacity-90'
          >
            <span className='text-xs font-[500] leading-[24px] tracking-[0.4px] text-primary-1  '>
              Edit Category
            </span>
          </button>
        </section>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryModal;
