/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import SearchComboBox from 'components/general/SearchComboBox';
import { useEffect, useState } from 'react';

import { Button } from 'components/shadcn/ui/button';
import { processError } from 'helper/error';
import { useQuery } from '@tanstack/react-query';
import CONSTANTS from 'constant';
import { formatCurrentDateTime } from 'helper';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'components/shadcn/dropdown-menu';
import { ChevronDown, Filter } from 'lucide-react';
import { nanoid } from 'nanoid';

import ProductCard from 'components/general/ProductCard';

import Icon from 'utils/Icon';
import { collection, doc, getDoc, getDocs, orderBy, query, updateDoc, deleteField } from 'firebase/firestore';
import { db } from 'firebase';
import useStore from 'store';
import FeaturedLoader from 'components/Loaders/FeaturedLoader';
import { getCreatedDateFromDocument } from 'lib/utils';
import useSortAndSearch from 'hooks/useSearchAndSort';
import { useCreate, useGetData } from 'hooks/requests';
const ProductsPage = () => {
  const { setIsEditing, setEditData } = useStore((state) => state);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCriterion, setSortCriterion] = useState('');
  const { create } = useCreate('add_product');
  const { data, refetch } = useGetData<any[]>('get_latest_merchant_products');
  const { create: createCustomQuantity } = useCreate('products/custom_quantity');

  async function fetchProducts() {
    const productsCollectionRef = collection(db, 'products');
    const productsQuery = query(productsCollectionRef, orderBy('created_date', 'desc'));

    const querySnapshot = await getDocs(productsQuery);

    const products: any = [];

    querySnapshot.forEach((doc) => {
      const createdDate = getCreatedDateFromDocument(doc as any);
      products.push({
        id: doc.id,
        ...doc.data(),
        createdDate,
      });
    });

    return products;
  }

  const { isLoading } = useQuery({
    queryKey: ['get-products'],
    queryFn: () => fetchProducts(),
    onSuccess: (data) => {
      console.log(data);
      setAllProducts(data);
    },

    onError: (err) => {
      processError(err);
    },
  });

  const updateProductsOnFirebase = async () => {
    if (
      Array.isArray(allProducts) &&
      allProducts?.length > 0 &&
      Array.isArray(data) &&
      data?.length < allProducts?.length
    ) {
      try {
        // Process all products and create/update them on Firebase
        await Promise.all(
          allProducts.map(async (product) => {
            const payload = {
              name: product?.name,
              description: product?.desc,
              price: product?.price,
              cost_price: product?.costprice,
              picture: null,
              merchant_product_category_id: product?.category?.loystarId,
              track_inventory: true,
              unit: 'units',
              quantity: product?.quantity,
            };
            // push to loystar
            const responseData = await create({ data: payload });

            if (responseData && Array.isArray(product?.units) && product?.units.length > 0) {
              // push custom quantity when there is unit
              const customQuantityPayload = product?.units?.map((item: any) => ({
                product_id: responseData.id,
                merchant_id: responseData.merchant_id,
                price: item.price,
                name: item.unit,
                quantity: Number(item.quantity || 0),
                barcode: '',
              }));

              await Promise.all(
                customQuantityPayload.map(async (custom: any) => {
                  await createCustomQuantity({ data: { ...custom } });
                }),
              );
            }

            if (responseData) {
              // Update Firebase with the loystarId
              const productDocRef = doc(db, 'products', product.id);
              const productDocSnap = await getDoc(productDocRef);

              if (productDocSnap.exists()) {
                const productDocData = productDocSnap.data();
                if (!productDocData.loystarId) {
                  await updateDoc(productDocRef, { loystarId: responseData.id, merchant_id: responseData?.merhcant_id });
                  console.log(`Updated loystarId for product: ${product.name}`);
                } else {
                  console.log(`Product ${product.name} already has a loystarId.`);
                }
              } else {
                console.warn(`Product document with ID ${product.id} does not exist.`);
              }
            }
          }),
        );

        console.log('Products updated successfully!');
      } catch (error) {
        console.error('Error updating products on Firebase:', error);
      }
    } else if (
      Array.isArray(allProducts) &&
      allProducts?.length > 0 &&
      Array.isArray(data) &&
      data?.length === allProducts?.length
    ) {
      await Promise.all(
        data?.map(async (item) => {
          const findProduct = allProducts?.find((v) => v?.loystarId === item?.id);

          if (findProduct) {
            const productDocRef = doc(db, 'products', findProduct.id);
            const productDocSnap = await getDoc(productDocRef);
            if (productDocSnap.exists()) {
              // const productDocData = productDocSnap.data();
              await updateDoc(productDocRef, {
                costprice: item?.cost_price,
                price: item?.price,
                quantity: item?.quantity,
              });
            } else {
              console.warn(`Product document with does not exist.`);
            }
          }
        }),
      );
    }
  };

  // useEffect(() => {
  //    updateProductsOnFirebase();
  // }, [allProducts, data]);

  // staging testing // remove loystarId from all the products

    // staging testing // remove loystarId from all the products
    // useEffect(() => {
    //   const removeLoystarIdFromFirebase = async () => {
    //     try {
    //       await Promise.all(
    //         allProducts.map(async (product) => {
    //           const productDocRef = doc(db, 'products', product.id);
    //           // Check if loystarId exists before attempting to delete
    //           if (product.loystarId) {
    //             await updateDoc(productDocRef, { loystarId: deleteField() }); 
    //             console.log(`Removed loystarId from product: ${product.name}`);
    //           }
    //         })
    //       );
    //       console.log('loystarId removed from all products successfully!');
    //     } catch (error) {
    //       console.error('Error removing loystarId from Firebase:', error);
    //     }
    //   };
  
    //   removeLoystarIdFromFirebase(); 
    // }, [allProducts]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleSortChange = (newValue: string) => {
    setSortCriterion(newValue);
  };

  const sortedAndFilteredProducts = useSortAndSearch(allProducts, searchTerm, sortCriterion);
  return (
    <div className='container flex h-full w-full max-w-[180.75rem] flex-col gap-6 overflow-auto  px-container-base pb-[2.1rem] md:px-container-md'>
      <div className='justify-between md:flex '>
        <div>
          <h3 className='mb-4 text-base font-semibold md:text-2xl'>Products</h3>
          <p className='hidden text-[0.85rem] md:block '>
            All products you have added will appear here
          </p>
        </div>
        <div>
          <p className='mb-6 hidden text-end text-[0.75rem] text-gray-400 md:block'>
            {formatCurrentDateTime()}
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
      <Link
        onClick={() => {
          setIsEditing(false);
          setEditData(null);
        }}
        to={`/app/${CONSTANTS.ROUTES['create-new-product']}`}
        className='group flex w-fit items-center justify-center gap-2 place-self-end   rounded-[5px] bg-primary-1 px-3 py-2 text-base font-semibold text-white transition-all duration-300 ease-in-out hover:opacity-90'
      >
        <Icon name='addIcon' />
        <span className='text-xs font-[400] leading-[24px] tracking-[0.4px] text-white '>
          Add Product
        </span>
      </Link>
      <FeaturedLoader isLoading={isLoading}>
        <div className='grid w-full grid-cols-1 gap-x-[1.5rem] gap-y-[2.875rem] sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'>
          {sortedAndFilteredProducts?.map((item: any, idx: number) => (
            <div key={idx} className='h-full w-full'>
              <ProductCard
                item={item}
                img={item?.image}
                name={item?.name}
                price={item?.price}
                link={`create-new-product`}
                rating={4.5}
              />
            </div>
          ))}
        </div>
      </FeaturedLoader>
    </div>
  );
};

export default ProductsPage;
