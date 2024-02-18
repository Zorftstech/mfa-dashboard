import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import moment from 'moment';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (i: string) => {
  return moment(i).format('MMM Do YY');
};
export const checkStatus = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500 text-white';
    case 'scheduled':
      return 'bg-primary-20 text-primary-21';
    case 'in progress':
      return 'bg-yellow-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};
