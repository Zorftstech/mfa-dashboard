import CONSTANTS from 'constant';
import AppointmentPage from 'pages/app/orders';
import Users from 'pages/app/users';
import BillingPage from 'pages/app/products';
import InventoryPage from 'pages/app/create-coupon';
import Laboratory from 'pages/app/food-bundles';
import Consultation from 'pages/app/flash-sales';
import Dashboard from 'pages/app/dashboard';
import GeneralForumns from 'pages/app/notifications';
import ReportsPage from 'pages/app/master-classes';
import ServiceAd from 'pages/app/coupons';
import Profile from 'pages/app/user-profile';
import AccountSettings from 'pages/app/settings';
import SingleBlog from 'pages/inner-pages/single-blog';
import SingleBts from 'pages/inner-pages/single-bts';
import SinglePatient from 'pages/inner-pages/single-patient';
import { routeTypes, routesInterface } from 'types';
import PatientsPage from 'pages/app/categories';
import CreatePatientPage from 'pages/app/create-category';
import CreateVisitPage from 'pages/app/create-subCategory';
import CreateNewProduct from 'pages/app/create-new-product';

const internalRoute: routeTypes = [
  {
    element: <Dashboard />,
    path: 'dashboard',
  },
  {
    element: <CreatePatientPage />,
    path: 'create-patient',
  },
  {
    element: <CreateVisitPage />,
    path: 'create-visit',
  },
  {
    element: <PatientsPage />,
    path: 'patients',
  },
  {
    element: <Users />,
    path: 'users',
  },
  {
    element: <Profile />,
    path: 'profile',
  },

  {
    element: <AppointmentPage />,
    path: 'appointment',
  },
  {
    element: <Consultation />,
    path: 'consultation',
  },
  {
    element: <BillingPage />,
    path: 'billing',
  },
  {
    element: <InventoryPage />,
    path: 'inventory',
  },
  {
    element: <Laboratory />,
    path: 'laboratory',
  },
  {
    element: <AccountSettings />,
    path: 'settings',
  },
  {
    element: <ReportsPage />,
    path: 'reports',
  },

  {
    element: <GeneralForumns />,
    path: 'general-forums',
  },

  {
    element: <ServiceAd />,
    path: 'service-ad',
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
