import ScrollToTop from 'components/animation/scroll-to-top';
import AppNav from 'components/partials/app-nav';
import SideNav from 'components/partials/side-nav';
import { useOutlet } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from 'firebase';
import { useEffect } from 'react';
import useStore from 'store';
import { processError } from 'helper/error';
import { useQuery } from '@tanstack/react-query';
const AppLayout = () => {
  const { setCategories, setSubcategories, setLoading, loggedIn } = useStore((state) => state);
  const outlet = useOutlet();
  async function fetchCategories() {
    setLoading(true);
    // Create a reference to the 'users' collection
    const categoriesCollectionRef = collection(db, 'categories');
    const subCategoriesCollectionRef = collection(db, 'subcategories');

    const querySnapshot = await getDocs(categoriesCollectionRef);
    const querySnapshotSub = await getDocs(subCategoriesCollectionRef);

    const categories: any = [];
    const subCategories: any = [];

    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() });
    });
    querySnapshotSub.forEach((doc) => {
      subCategories.push({ id: doc.id, ...doc.data() });
    });

    setLoading(false);
    return { categories, subCategories };
  }

  const { data, isLoading } = useQuery({
    queryKey: ['get-categories'],
    queryFn: () => fetchCategories(),
    onSuccess: (data) => {
      setCategories(data.categories);
      setSubcategories(data.subCategories);
    },
    onError: (err) => {
      processError(err);
    },
  });

  return (
    <div className='flex h-full w-full '>
      <aside className='z-[1] hidden h-full w-max overflow-visible md:flex'>
        <SideNav />
      </aside>
      <main className='flex flex-grow flex-col bg-white'>
        <ScrollToTop />
        <AppNav />
        <section className='no-scrollbar relative mx-auto mt-10  h-full w-full max-w-[180.75rem]  overflow-x-hidden md:overflow-auto '>
          <ScrollToTop />
          {outlet}
        </section>
      </main>
    </div>
  );
};

export default AppLayout;
