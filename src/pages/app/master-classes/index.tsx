import FunkyPagesHero from 'components/general/FunkyPagesHero';
import PillTabs from 'components/general/PillTabs';
import SearchComboBox from 'components/general/SearchComboBox';
import { useState } from 'react';
import MasterClassCard from 'components/general/MasterClassCard';
import filmImg from 'assets/image/masterClassImg.png';

import { useQuery } from '@tanstack/react-query';
import contentService from 'services/content';
import { processError } from 'helper/error';
type filterTypes = 'All' | 'Upcoming' | 'Completed';

const generalFilters: filterTypes[] = ['All', 'Upcoming', 'Completed'];

const ReportsPage = () => {
  const [currFilter, setCurrFilter] = useState<filterTypes>('All');

  return (
    <div className='container flex h-full w-full max-w-[180.75rem] flex-col gap-8 overflow-auto px-container-md pb-[2.1rem]'>
      <FunkyPagesHero
        // description='Find and register for masterclasses organized by Anthill studios'
        title='Reports'
      />

      <div className='relative mx-auto my-[1.5rem] w-full max-w-[800px] md:-top-[1.5rem] md:my-0 md:mb-[1.75rem]'>
        <SearchComboBox />
      </div>
      <div className='mb-[1.5rem] flex w-full justify-center'>
        <PillTabs
          tabs={generalFilters}
          currActive={currFilter}
          onSelect={(i) => setCurrFilter(i)}
        />
      </div>
      <div className='grid w-full grid-cols-1 gap-x-[1.5rem] gap-y-[3.875rem] sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'>
        {[...Array(8)]?.map((_, idx) => (
          <div key={idx} className='h-full w-full'>
            <MasterClassCard
              adImage={filmImg}
              description={`Filmmaking is an art form that requires a combination of technical skills and...`}
              location='Landmark, Lokoja'
              price='11/04/22023'
              title='"From Script to Screen: The Filmmaking Process"'
              link={`a7f1477dc36041aabd2c40d5c8598e3f`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;
