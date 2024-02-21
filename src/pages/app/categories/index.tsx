import FunkyPagesHero from 'components/general/FunkyPagesHero';
import PillTabs from 'components/general/PillTabs';
import SearchComboBox from 'components/general/SearchComboBox';
import { useEffect, useState } from 'react';
import CatImg from 'assets/image/catImg.jpeg';
import Potatoes from 'assets/image/potatoes.jpeg';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from 'components/shadcn/dialog';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { shimmer, toBase64 } from 'utils/general/shimmer';
import { Button } from 'components/shadcn/ui/button';
import productService from 'services/product';
import { processError } from 'helper/error';
import { useQuery } from '@tanstack/react-query';
import { apiInterface, productInterface } from 'types';
import ContentLoader from 'components/general/ContentLoader';
import assetImg from 'assets/image/assetFilmImg.png';
import CONSTANTS from 'constant';
import { filterStringsContainingDoc, filterStringsContainingImageExtensions } from 'helper';
import FileSaver from 'file-saver';
import { Link, useSearchParams } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'components/shadcn/dropdown-menu';
import { ChevronDown, Filter } from 'lucide-react';
import CategoryModal from 'components/modal/CategoryModal';
import contentService from 'services/content';
import Icon from 'utils/Icon';
import CategoryCard from 'components/general/CategoryCard';

type filterTypes =
  | 'All'
  | 'Pre-Production'
  | 'Post-production'
  | 'Distribution and Marketing'
  | 'Starred';

const generalFilters: filterTypes[] = [
  'All',
  'Pre-Production',
  'Distribution and Marketing',
  'Starred',
];

const Categories = () => {
  const [position, setPosition] = useState('bottom');

  const [currFilter, setCurrFilter] = useState<filterTypes>('All');
  // const [templateExpanded, setTemplateExpanded] = useState(false);
  // const [currentFocusedTemplate, setCurrentFocusedTemplate] = useState<productInterface | null>(
  //   null,
  // );
  // const [downloadConfirmationOpen, setDownloadConfirmationOpen] = useState(false);
  // const [stagedFile, setStagedFile] = useState('');
  // const [searchparams] = useSearchParams();

  // const { data, isLoading } = useQuery<apiInterface<productInterface[]>>({
  //   queryKey: ['get-assets-templates'],
  //   queryFn: () =>
  //     productService.getProduct({
  //       organization_id: import.meta.env.VITE_TIMBU_ORG_ID,
  //     }),
  //   onError: (err) => {
  //     processError(err);
  //   },
  // });

  // const doFileDownLoad = () => {
  //   setDownloadConfirmationOpen(false);
  //   FileSaver.saveAs(stagedFile);
  // };

  // useEffect(() => {
  //   const targetedId = searchparams.get('open');
  //   if (targetedId) {
  //     const item = data?.items?.find((i) => i?.id === targetedId);
  //     if (item) {
  //       setCurrentFocusedTemplate(item);
  //       setTemplateExpanded(true);
  //     }
  //   }
  // }, [searchparams, data]);

  return (
    <div className='container flex h-full w-full max-w-[180.75rem] flex-col gap-6  overflow-auto px-container-md pb-[5.1rem]'>
      <div className='flex justify-between '>
        <div>
          <h3 className='mb-4 text-base font-semibold md:text-2xl'>Categories</h3>
          <p className='text-[0.85rem] '>All the categories currently available</p>
        </div>
        <div>
          <p className='mb-6 text-end  text-[0.75rem] text-gray-400'>
            Today: 10:23am, 30th Oct 2023
          </p>
          <div className='flex   gap-3'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  className='group flex w-6/12 items-center justify-center gap-2 rounded-[5px]  border-0   px-2 py-4 text-base  font-semibold shadow-md transition-all duration-300 ease-in-out hover:opacity-90'
                >
                  <Filter className='w-4 cursor-pointer fill-primary-4 stroke-primary-4   transition-opacity duration-300 ease-in-out hover:opacity-95 active:opacity-100' />
                  <p className='text-[0.65rem] font-[500]'>Filter by</p>
                  <ChevronDown className='w-4 cursor-pointer  transition-opacity duration-300 ease-in-out hover:opacity-95 active:opacity-100' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-56 text-[0.65rem]'>
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
                  <DropdownMenuRadioItem value='top'>Year</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value='bottom'>Month</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value='right'>Day</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <SearchComboBox />
          </div>
        </div>
      </div>
      {/* categories */}
      <section className='flex flex-col gap-6'>
        <div className='flex items-center justify-between'>
          <p className='text-lg font-medium'>Categories</p>
          <Link
            to={`/app/${CONSTANTS.ROUTES['create-category']}`}
            className='group flex w-fit items-center justify-center gap-2    rounded-[5px] bg-primary-1 px-3 py-2 text-base font-semibold text-white transition-all duration-300 ease-in-out hover:opacity-90'
          >
            <Icon name='addIcon' />
            <span className='text-xs font-[400] leading-[24px] tracking-[0.4px] text-white '>
              Add Category
            </span>
          </Link>
        </div>

        <div className='grid w-full grid-cols-1 gap-x-[1.5rem] gap-y-[2.875rem] sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-5'>
          {[...Array(5)]?.map((_, idx) => (
            <CategoryModal
              trigger={
                <div key={idx} className='h-full w-full'>
                  <CategoryCard
                    img={CatImg}
                    name='Nigerian soups & stews'
                    link='a7f1477dc36041aabd2c40d5c8598e3f'
                  />
                </div>
              }
              title='Nigerian soups & stews'
              img={CatImg}
              desc='Nigerian soups & stews are local delicacies that are enjoyed by many. They are rich in nutrients and are a great source of energy.'
            ></CategoryModal>
          ))}
        </div>
      </section>
      {/* subCategories */}
      <section className='mt-16 flex flex-col gap-6'>
        <div className='flex items-center justify-between'>
          <p className='text-lg font-medium'>Sub-categories</p>
          <Link
            to={`/app/${CONSTANTS.ROUTES['create-sub-category']}`}
            className='group flex w-fit items-center justify-center gap-2    rounded-[5px] bg-primary-1 px-3 py-2 text-base font-semibold text-white transition-all duration-300 ease-in-out hover:opacity-90'
          >
            <Icon name='addIcon' />
            <span className='text-xs font-[400] leading-[24px] tracking-[0.4px] text-white '>
              Add sub-category
            </span>
          </Link>
        </div>

        <div className=' grid w-full grid-cols-1 gap-x-[1.5rem] gap-y-[2.875rem] sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-5'>
          {[...Array(5)]?.map((_, idx) => (
            <div key={idx} className='h-full w-full'>
              <CategoryCard
                img={Potatoes}
                name='Potatoes'
                mainCategory='Nigerian soups & stews'
                link='a7f1477dc36041aabd2c40d5c8598e3f'
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Categories;
