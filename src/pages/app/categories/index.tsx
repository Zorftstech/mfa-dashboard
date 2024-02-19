import PatientsRecords from './Records';
import PatientsReports from './Reports';
import { useState } from 'react';
import Icon from 'utils/Icon';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'components/shadcn/dropdown-menu';
import UserTableComponent from 'components/Tables/UsersTable/UsersTable';
import { Link } from 'react-router-dom';
import CONSTANTS from 'constant';
import FunkyPagesHero from 'components/general/FunkyPagesHero';

type filterTypes = 'patients records' | 'patients reports';

interface Filter {
  name: filterTypes;
  icon: JSX.Element;
}
const PatientsFilter: Filter[] = [
  { name: 'patients records', icon: <Icon name='profileIcon' /> },
  { name: 'patients reports', icon: <Icon name='padLockV2' /> },
];

interface Tabs {
  title: filterTypes;
}

const DisplayTab = ({ title }: Tabs) => {
  const components: Record<filterTypes, JSX.Element> = {
    'patients records': <PatientsRecords />,
    'patients reports': <PatientsReports />,
  };

  return components[title];
};

const Categories = () => {
  const [currFilter, setCurrFilter] = useState<filterTypes>('patients records');

  return (
    <div className='container flex h-full w-full max-w-[180.75rem] flex-col gap-8 overflow-auto px-container-md pb-[2.1rem]'>
      {/* to be refactored */}
      {/* <div className='flex justify-between '>
        <p className='text-base font-semibold text-primary-1'>Patients</p>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={`focus-within:outline-0 focus-within:ring-0 focus:ring-0 active:ring-0`}
          >
            <Icon name='menu' />
          </DropdownMenuTrigger>
          <DropdownMenuContent className='mr-[1.5rem] bg-white   shadow-5'>
            {PatientsFilter?.map((i, idx) => (
              <DropdownMenuItem key={idx} className=''>
                <button
                  key={idx}
                  className={`${
                    i?.name === currFilter
                      ? `bg-primary-1  text-white`
                      : `bg-transparent text-secondary-2 hover:text-primary-1`
                  } flex h-full  w-max items-center rounded-[5px] px-[1.5rem]  py-3 text-start transition-all ease-in-out `}
                  onClick={() => setCurrFilter(i?.name)}
                >
                  <span className='mt-[3px] whitespace-nowrap text-start text-[13px] font-semibold capitalize leading-3 tracking-[0.15px] md:mt-0 lg:text-[13px]'>
                    {i?.name}
                  </span>
                </button>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div> */}
      <FunkyPagesHero
        // description='Access bi-annual bootcamps and register!'
        title='Categories'
      />
      {/* <Link
        to={`/app/${CONSTANTS.ROUTES['create-new-product']}`}
        className='group flex  items-center justify-center gap-2  rounded-[5px] bg-primary-1  px-4 text-base font-semibold text-white transition-all duration-300 ease-in-out hover:opacity-90'
      >
        <Icon
          name='addIcon'
          svgProp={{
            className:
              'text-primary-1 cursor-pointer hover:opacity-95 transition-opacity duration-300 ease-in-out active:opacity-100',
          }}
        />
        <span className='text-xs font-[500] leading-[24px] tracking-[0.4px] text-white md:text-sm'>
          New Patient
        </span>
      </Link> */}
      <div className='relative grid w-full'>{/* <UserTableComponent /> */}</div>
    </div>
  );
};

export default Categories;
