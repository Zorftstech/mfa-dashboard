import FunkyPagesHero from 'components/general/FunkyPagesHero';
import PillTabs from 'components/general/PillTabs';
import PlanGuard from 'guards/PlanGuard';
import { useState } from 'react';
import adPlaceholder from 'assets/image/advertPlaceholder.png?format=webp&imagetools';
import AdvertCard from 'components/general/AdvertCard';
import Icon from 'utils/Icon';

type filterTypes = 'Your Ads' | 'Expired  Ads';
type viewTypes = 'All' | 'Create' | 'View';

const generalFilters: filterTypes[] = ['Your Ads', 'Expired  Ads'];

interface ComponentProps {
  setCurrentView: React.Dispatch<React.SetStateAction<viewTypes>>;
}

const AllAds = ({ setCurrentView }: ComponentProps) => {
  const [currFilter, setCurrFilter] = useState<filterTypes>('Your Ads');

  return (
    <div className='container flex w-full flex-col px-container-base py-[1.875rem]'>
      <FunkyPagesHero
        description='Put out an Ad for a service and find interested candidates!'
        title='Advertise a Service'
      />

      <div className='my-[2.5rem] flex w-full justify-center'>
        <PillTabs
          tabs={generalFilters}
          currActive={currFilter}
          onSelect={(i) => setCurrFilter(i)}
        />
      </div>
      <div className='grid grid-cols-1 gap-x-[1.5rem] gap-y-[2.5rem] sm:grid-cols-2  md:grid-cols-3 lg:grid-cols-4'>
        <div className='group flex h-max w-full cursor-pointer flex-col justify-between'>
          <div className='flex flex-col'>
            <div
              className='relative mb-[1rem] grid h-[16.93rem] w-full place-items-center overflow-hidden
                 rounded-[8px] border-b-4 bg-white transition-all duration-300 ease-in-out
                  '
              role='button'
              onClick={() => setCurrentView('Create')}
            >
              <Icon name='bigPlus' />
            </div>
            <div className='mb-4 flex w-full items-center justify-between'>
              <span className='text-[14px] font-[600] leading-[21px] tracking-[0.1px] text-primary-1 '>
                Create a new Ad
              </span>
              <span className='text-[14px] font-[300] leading-[21px] tracking-[0.1px] text-secondary-2 '></span>
            </div>
            <h5 className='mb-4 text-[20px] font-[700] leading-[27px] text-primary-12'>Blank</h5>
          </div>
        </div>
        {[...Array(3)]?.map((_, idx) => (
          <div key={idx} className='h-full w-full' onClick={() => setCurrentView('View')}>
            <AdvertCard
              adImage={adPlaceholder}
              description={`Filmmaking is an art form that requires a combination of technical skills and...`}
              location='Landmark, Lokoja'
              price='N10 000'
              title='We need a Cinematographer for a Shoot in Lokoja!'
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllAds;
