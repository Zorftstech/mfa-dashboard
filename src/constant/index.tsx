import { routePathTypes } from 'types';

const ROUTES: Record<routePathTypes, routePathTypes> = {
  '': '',
  'create-account': 'create-account',
  blogs: 'blogs',
  logout: 'logout',
  'new-password': 'new-password',
  'reset-password': 'reset-password',
  'forgot-password': 'forgot-password',
  'verify-email': 'verify-email',
  dashboard: 'dashboard',
  settings: 'settings',
  profile: 'profile',
  users: 'users',
  login: 'login',
  orders: 'orders',
  products: 'products',
  'create-coupon': 'create-coupon',
  'food-bundles': 'food-bundles',
  'flash-sales': 'flash-sales',
  notifications: 'notifications',
  coupons: 'coupons',
  'user-profile': 'user-profile',
  categories: 'categories',
  'create-category': 'create-category',
  'create-coupons': 'create-coupons',
  'create-food-bundle': 'create-food-bundle',
  'create-subCategory': 'create-subCategory',

  'create-new-product': 'create-new-product',
};

const TIMBU_KEYS = {
  BTS_ID: 'a3b42063504f4372ac9a1a6bd0f46d85',
  BLOG_ID: '696dccd73fb242448c41704b5179698f',
  IMAGE_BASE_URL: 'https://images.timbu.com',
};

const CONSTANTS = { ROUTES, TIMBU_KEYS };

export default CONSTANTS;
