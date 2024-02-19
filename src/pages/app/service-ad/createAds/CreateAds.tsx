import CustomInput from 'components/shadcn/CustomInput';
import { CustomTextArea } from 'components/shadcn/customTextArea';
import DatePicker from 'components/shadcn/datePicker';
import { Popover, PopoverTrigger } from 'components/shadcn/popover';
import { Button } from 'components/shadcn/ui/button';
import { FormControl } from 'components/shadcn/ui/form';
import PlanGuard from 'guards/PlanGuard';
import { cn } from 'lib/utils';
import Icon from 'utils/Icon';

type viewTypes = 'All' | 'Create' | 'View';

interface ComponentProps {
  setCurrentView: React.Dispatch<React.SetStateAction<viewTypes>>;
}

const CreateAds = ({ setCurrentView }: ComponentProps) => {
  return (
    <div className='container flex w-full flex-col px-container-base py-[1.875rem]'>
      <div>
        <div className='mb-6 flex items-start justify-between'>
          <button
            className=' group  mb-4 flex items-center justify-center gap-2 rounded-[15px] transition-all duration-300 ease-in-out hover:opacity-90'
            onClick={() => setCurrentView('All')}
          >
            <Icon
              name='arrowBack'
              svgProp={{
                className:
                  ' bg-white rounded-2xl text-gray-600 px-1 cursor-pointer hover:opacity-95 transition-opacity duration-300 ease-in-out active:opacity-100',
              }}
            />
            <span className='text-sm font-[500] leading-[24px] tracking-[0.4px] text-gray-600'>
              {' '}
              Go Back
            </span>
          </button>
        </div>
        <section className=' items-center rounded-md bg-white py-4'>
          <div className=' flex w-full items-center justify-between border-b border-gray-200 px-5 py-4 md:px-8'>
            <p className='text-[14px] font-semibold text-gray-800 md:text-[15px] lg:text-[16px]'>
              Create an Ad
            </p>
            <span>
              <Icon
                name='cancelIcon'
                svgProp={{
                  className: 'fill-gray-800',
                }}
              />
            </span>
          </div>
          <div className='border-b border-gray-200 px-5 py-8 md:px-8'>
            <CustomInput label='Give your ad a title' type='text' className='mb-7 w-full' />
            <CustomInput
              label='Add Category (The Job is for ...)'
              type='text'
              className='mb-7 w-full'
            />
            <div className='mb-7 flex w-full flex-wrap gap-x-5 gap-y-5 md:flex-nowrap'>
              <span className='w-[100%] md:w-[50%]'>
                <DatePicker label='Specify Duration (Optional)' />
              </span>
              <span className='w-[100%] md:w-[50%]'>
                <DatePicker label='Pay (Optional)' />
              </span>
            </div>
            <div className='mb-7'>
              <CustomTextArea label='Job Overview (Optional)' />
            </div>
            <div className='mb-7'>
              <CustomTextArea label='Responsibilities' />
            </div>
            <div className='mb-7'>
              <CustomTextArea label='Requirements (Optional)' />
            </div>
            <div className='mb-7'>
              <CustomTextArea label='Benefits (Optional)' />
            </div>
          </div>
          <div className=' flex justify-end gap-x-4 px-8 py-5'>
            <button
              className='group flex w-max items-center justify-center gap-2 rounded-[8px] border border-gray-200 bg-white px-[1.1rem] py-[0.3rem] text-gray-500 transition-all duration-300 ease-in-out hover:bg-gray-100 hover:opacity-90 md:px-[1.5rem]'
              onClick={() => setCurrentView('All')}
            >
              <span className='text-[13px] leading-[28px] tracking-[0.15px] md:text-[14px] lg:text-[16px]'>
                CANCEL
              </span>
            </button>
            <button
              className='group flex w-max items-center justify-center gap-2 rounded-[8px] bg-primary-1 px-[1.1rem] py-[0.3rem] transition-opacity duration-300 ease-in-out hover:opacity-90 md:px-[1.5rem]'
              onClick={() => setCurrentView('View')}
            >
              <span className='text-[13px] leading-[28px] tracking-[0.15px] text-white md:text-[14px] lg:text-[16px]'>
                SAVE
              </span>
              <Icon
                name='arrowTo'
                svgProp={{
                  className: 'text-white fill-white',
                }}
              />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CreateAds;
