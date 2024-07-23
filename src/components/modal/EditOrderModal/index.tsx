import { Dialog, DialogContent, DialogTrigger } from 'components/shadcn/dialog';

import { useState } from 'react';
import Icon from 'utils/Icon';
import { useNavigate } from 'react-router-dom';
import TextInfoSTack from 'components/general/InfoStack/InfoStack';
import { Checkbox } from 'components/shadcn/checkbox';

interface Iprop {
  trigger: JSX.Element;
  triggerClassName?: string;
  title?: string;
}

const EditWalletBalanceModal = ({ trigger, triggerClassName, title }: Iprop) => {
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <Dialog onOpenChange={(i) => setModalOpen(i)} open={modalOpen}>
      <DialogTrigger className={triggerClassName}>{trigger}</DialogTrigger>
      <DialogContent className='no-scrollbar mt-4  w-full max-w-full overflow-auto  overflow-x-hidden bg-white  px-6  md:!max-w-[700px] lg:px-[2rem]'>
        <div className='flex w-full flex-col '>
          <div className='w-full gap-[0.87rem] py-6'>
            {/* <Icon name='saveIcon' svgProp={{ className: 'w-20 h-16 text-gray-500' }} /> */}
            <p className='mb-6 text-xl font-semibold'>Edit wallet balance</p>

            <div className='my-4 space-y-3'>
              <p className='text-sm font-semibold'>Amount (₦)</p>
              <div className='flex flex-grow items-center rounded-lg border px-6 '>
                <input className='form-input mx-2 flex-grow border-0  placeholder:text-sm placeholder:font-bold placeholder:text-textColor-disabled focus:!ring-0' />
              </div>
            </div>

            <section className='my-8 flex  gap-8'>
              <div className='flex flex-row items-center gap-2 rounded-md '>
                <Checkbox />

                <div className=' leading-none'>
                  <label className='text-sm font-semibold '>Debit</label>
                </div>
              </div>
              <div className='flex flex-row items-center gap-2  rounded-md '>
                <Checkbox />

                <div className=' leading-none'>
                  <label className='text-sm font-semibold'>Credit</label>
                </div>
              </div>
            </section>
            <div className='my-4 space-y-3'>
              <p className='text-sm font-semibold'>Description</p>
              <div className='flex flex-grow items-center rounded-lg border px-6 '>
                <input className='form-input mx-2 flex-grow border-0  placeholder:text-sm placeholder:font-bold placeholder:text-textColor-disabled focus:!ring-0' />
              </div>
            </div>

            <div className='my-4 mt-8 flex w-full justify-end gap-4'>
              <button className='group flex  items-center justify-center gap-2  rounded-[5px] bg-primary-1 px-8 py-2 text-base font-semibold text-white transition-all duration-300 ease-in-out hover:opacity-90'>
                <span className='text-xs font-[500] leading-[24px] tracking-[0.4px] text-white md:text-sm'>
                  Update Wallet Balance
                </span>
              </button>

              <button className='group flex  items-center justify-center gap-2  rounded-[5px] border   px-5 text-base font-semibold transition-all duration-300 ease-in-out hover:opacity-90'>
                <span className='text-xs font-[500] leading-[24px] tracking-[0.4px]  md:text-sm'>
                  Cancel
                </span>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditWalletBalanceModal;
