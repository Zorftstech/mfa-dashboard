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

import CategoryCard from 'components/general/CategoryCard';

import Icon from 'utils/Icon';

import FeaturedLoader from 'components/Loaders/FeaturedLoader';
import useStore from 'store';
import { getCreatedDateFromDocument } from 'lib/utils';
import useSortAndSearch from 'hooks/useSearchAndSort';
import { collection, doc, getDoc, getDocs, query, writeBatch } from 'firebase/firestore';
import { db } from 'firebase';
import { useCreate, useGetData, useLoystarGetRequest } from 'hooks/requests';

const Categories = () => {
  const { setIsEditing, setEditData } = useStore((state) => state);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCriterion, setSortCriterion] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoystarUpdated, setIsLoystarUpdated] = useState(false);
  const { create } = useCreate('add_product_category');
  const { data, refetch } = useLoystarGetRequest<any[]>('get_latest_merchant_product_categories', {
    data: {
      time_stamp: 0,
    },
  });
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleSortChange = (newValue: string) => {
    setSortCriterion(newValue);
  };

  const sortedAndFilteredCategories = useSortAndSearch(categories, searchTerm, sortCriterion);

  async function fetchCategories() {
    const categoriesCollectionRef = collection(db, 'categories');
    const categoryQuery = query(categoriesCollectionRef);

    const querySnapshot = await getDocs(categoryQuery);

    const categoryArray: any = [];
    querySnapshot.forEach((doc) => {
      const createdDate = getCreatedDateFromDocument(doc as any);
      // console.log("doc", doc.data())
      categoryArray.push({
        id: doc.id,
        ...doc.data(),
        createdDate,
      });
    });

    return categoryArray;
  }

  const { isLoading } = useQuery({
    queryKey: ['get-categories'],
    queryFn: () => fetchCategories(),
    onSuccess: (data) => {
      //  setAllProducts(data);
      // console.log('data', data)
      setCategories(data);
    },

    onError: (err) => {
      processError(err);
    },
  });

  useEffect(() => {
    (async () => {
      if (
        Array.isArray(categories) &&
        categories?.length > 0 &&
        Array.isArray(data) &&
        data?.length < categories?.length
      ) {
        await Promise.all(
          categories?.map(async (category) => {
            const payload = {
              name: category?.name,
            };
            await create({ data: payload });
          }),
        );
        await refetch();
      }
      setIsLoystarUpdated(true);
    })();
  }, [categories, data]);


  // deprecated for now - but maybe the needed later
  
  // useEffect(() => {
  //   if (
  //     isLoystarUpdated &&
  //     Array.isArray(data) &&
  //     Array.isArray(categories) &&
  //     categories.length > 0 &&
  //     data?.length > 0
  //   ) {
  //     const allCategoryNamesMatch = categories.every((category) => {
  //       return data.some((item) => category.name === item.name);
  //     });
  
  //     if (allCategoryNamesMatch) {
  //       const batch = writeBatch(db);
  
  //       const checkAndUpdateCategories = async () => {
  //         for (const category of categories) {
  //           const matchingData = data.find((item) => item.name === category.name);
  
  //           if (matchingData) {
  //             const categoryDocRef = doc(db, "categories", category.id);
  
  //             try {
  //               // Check if `loystarId` already exists
  //               const categoryDocSnap = await getDoc(categoryDocRef);
  
  //               if (categoryDocSnap.exists()) {
  //                 const categoryDocData = categoryDocSnap.data();
  
  //                 if (!categoryDocData.loystarId) {
  //                   // Add to batch only if `loystarId` is not already present
  //                   batch.update(categoryDocRef, {
  //                     loystarId: matchingData.id,
  //                   });
  //                   console.log(
  //                     `loystarId: ${matchingData.id} will be added to category ${category.name}`
  //                   );
  //                 } else {
  //                   console.log(
  //                     `Category ${category.name} already has a loystarId.`
  //                   );
  //                 }
  //               } else {
  //                 console.warn(
  //                   `Category document with ID ${category.id} does not exist.`
  //                 );
  //               }
  //             } catch (error) {
  //               console.error(
  //                 `Error checking loystarId for category ${category.name}:`,
  //                 error
  //               );
  //             }
  //           }
  //         }
  
  //         // Commit the batch after all checks are complete
  //         try {
  //           await batch.commit();
  //           console.log("Batch update completed!");
  //         } catch (error) {
  //           console.error("Batch update failed:", error);
  //         }
  //       };
  
  //       checkAndUpdateCategories();
  //     }
  //   }
  // }, [isLoystarUpdated, data, categories]);

  return (
    <div className='container flex h-full w-full max-w-[180.75rem] flex-col gap-6 px-container-base  pb-[5.1rem] md:overflow-auto md:px-container-md'>
      <div className='justify-between md:flex '>
        <div>
          <h3 className='mb-4 text-base font-semibold md:text-2xl'>Categories</h3>
          <p className='hidden text-[0.85rem] md:block '>
            All the and categories currently available
          </p>
        </div>
        <div>
          <p className='mb-6 hidden text-end text-[0.75rem]  text-gray-400 md:block'>
            {formatCurrentDateTime()}
          </p>
          <div className='my-4 flex  gap-3 md:my-0 '>
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
                <DropdownMenuRadioGroup value={sortCriterion} onValueChange={handleSortChange}>
                  <DropdownMenuRadioItem value='year'>Year</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value='month'>Month</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value='day'>Day</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <SearchComboBox value={searchTerm} onChange={handleSearch} />
          </div>
        </div>
      </div>
      {/* categories */}
      <section className='flex flex-col gap-6'>
        <div className='flex items-center justify-between'>
          <p className='text-lg font-medium'>Categories</p>
          <Link
            onClick={() => {
              setIsEditing(false);
              setEditData(null);
            }}
            to={`/app/${CONSTANTS.ROUTES['create-category']}`}
            className='group flex w-fit items-center justify-center gap-2    rounded-[5px] bg-primary-1 px-3 py-2 text-base font-semibold text-white transition-all duration-300 ease-in-out hover:opacity-90'
          >
            <Icon name='addIcon' />
            <span className='text-xs font-[400] leading-[24px] tracking-[0.4px] text-white '>
              Add Category
            </span>
          </Link>
        </div>

        <FeaturedLoader isLoading={isLoading}>
          <div className='grid w-full grid-cols-2 gap-x-[1.5rem] gap-y-[2.875rem] sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-5'>
            {sortedAndFilteredCategories?.map((item: any, idx: number) => (
              <CategoryModal
                trigger={
                  <div key={idx} className='h-full w-full'>
                    <CategoryCard img={item?.image} name={item?.name} link={item?.id} />
                  </div>
                }
                title={item?.name}
                img={item?.image}
                desc={item?.desc}
                item={item}
                subcategories={item?.subcategories}
                isSubcategory={false}
              ></CategoryModal>
            ))}
          </div>
        </FeaturedLoader>
      </section>
    </div>
  );
};

export default Categories;
