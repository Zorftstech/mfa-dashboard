import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import moment from 'moment';
import { Timestamp } from 'firebase/firestore';
interface DocumentData {
  _document: {
    createTime: {
      timestamp: Timestamp;
    };
  };
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (i: string) => {
  return moment(i).format('MMM Do YY');
};
export function getCreatedDateFromDocument(documentData: DocumentData): string {
  const createTime = documentData._document.createTime.timestamp;
  const createdDate = new Date(createTime.seconds * 1000); // Convert seconds to milliseconds
  return formatDate(createdDate.toDateString());
}
export const checkStatus = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-600';
    case 'scheduled':
      return 'text-yellow-400';
    case 'in progress':
      return 'text-yellow-500';
    default:
      return 'text-red-500';
  }
};
