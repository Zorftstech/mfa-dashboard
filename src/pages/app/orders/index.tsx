import AssetCard from 'components/general/AssetCard';
import FunkyPagesHero from 'components/general/FunkyPagesHero';
import PillTabs from 'components/general/PillTabs';
import SearchComboBox from 'components/general/SearchComboBox';
import { useEffect, useState } from 'react';
import filmImg from 'assets/image/assetFilmImg.png';
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
import {
  filterStringsContainingDoc,
  filterStringsContainingImageExtensions,
  formatCurrentDateTime,
} from 'helper';
import FileSaver from 'file-saver';
import { useSearchParams } from 'react-router-dom';
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
import OrdersTableComponent from 'components/Tables/OrdersTable/OrdersTable';
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

const OrdersPage = () => {
  const [position, setPosition] = useState('bottom');

  // const [currFilter, setCurrFilter] = useState<filterTypes>('All');
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
    <div className='container flex h-full w-full max-w-[180.75rem] flex-col px-container-base pb-[2.1rem] md:overflow-auto md:px-container-md'>
      <div className='relative grid w-full'>
        <OrdersTableComponent />
      </div>
    </div>
  );
};

export default OrdersPage;
