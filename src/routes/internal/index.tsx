import CONSTANTS from 'constant';
import Orders from 'pages/app/orders';
import Users from 'pages/app/users';
import Products from 'pages/app/products';
import CreateCoupon from 'pages/app/create-coupon';
import FoodBundles from 'pages/app/food-bundles';
import FlashSales from 'pages/app/flash-sales';
import Dashboard from 'pages/app/dashboard';
import Categories from 'pages/app/categories';
import Notifications from 'pages/app/notifications';
import MasterClasses from 'pages/app/master-classes';
import Coupons from 'pages/app/coupons';
import UserProfile from 'pages/app/user-profile';
import Settings from 'pages/app/settings';
import SingleBlog from 'pages/inner-pages/single-blog';
import SinglePatient from 'pages/inner-pages/single-patient';
import { routeTypes, routesInterface } from 'types';
import CreateCategory from 'pages/app/create-category';
import CreateSubCategory from 'pages/app/create-subCategory';
import CreateNewProduct from 'pages/app/create-new-product';
import CreateFoodBundle from 'pages/app/create-food-bundle';
import CreateFlashSale from 'pages/app/create-flash-sale';

const internalRoute: routeTypes = [
  {
    element: <Dashboard />,
    path: 'dashboard',
  },
  {
    element: <CreateCategory />,
    path: 'create-category',
  },
  {
    element: <CreateSubCategory />,
    path: 'create-sub-category',
  },
  {
    element: <Categories />,
    path: 'categories',
  },
  {
    element: <Users />,
    path: 'users',
  },
  {
    element: <UserProfile />,
    path: 'profile',
  },

  {
    element: <Orders />,
    path: 'orders',
  },
  {
    element: <FlashSales />,
    path: 'flash-sales',
  },
  {
    element: <Products />,
    path: 'products',
  },
  {
    element: <CreateCoupon />,
    path: 'create-coupon',
  },
  {
    element: <FoodBundles />,
    path: 'food-bundles',
  },
  {
    element: <Settings />,
    path: 'settings',
  },

  {
    element: <CreateFoodBundle />,
    path: 'create-food-bundle',
  },
  {
    element: <CreateFlashSale />,
    path: 'create-flash-sale',
  },
  // {
  //   element: <MasterClasses />,
  //   path: 'reports',
  // },

  {
    element: <Notifications />,
    path: 'notifications',
  },

  {
    element: <Coupons />,
    path: 'coupons',
  },
  {
    element: <CreateNewProduct />,
    path: 'create-new-product',
  },
];

export const innerInternalRoutes: routesInterface<string>[] = [
  { element: <SingleBlog />, path: `${CONSTANTS.ROUTES.blogs}/:id` },
];

export default internalRoute;
