import CONSTANTS from 'constant';
import AppointmentPage from 'pages/app/appointment';
import Users from 'pages/app/users';
import BillingPage from 'pages/app/billing';
import InventoryPage from 'pages/app/inventory';
import Laboratory from 'pages/app/laboratory';
import Consultation from 'pages/app/consultation';
import Dashboard from 'pages/app/dashboard';
import GeneralForumns from 'pages/app/general-forums';
import ReportsPage from 'pages/app/master-classes';
import OnlineTraining from 'pages/app/online-training';
import ServiceAd from 'pages/app/coupons';
import Profile from 'pages/app/user-profile';
import AccountSettings from 'pages/app/account-settings';
import SingleBlog from 'pages/inner-pages/single-blog';
import SingleBts from 'pages/inner-pages/single-bts';
import SinglePatient from 'pages/inner-pages/single-patient';
import { routeTypes, routesInterface } from 'types';
import PatientsPage from 'pages/app/patients';
import CreatePatientPage from 'pages/app/create-patient';
import CreateVisitPage from 'pages/app/create-visit';
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
    element: <OnlineTraining />,
    path: 'online-training',
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
