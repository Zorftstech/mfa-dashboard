import { AxiosError } from 'axios';
import toast from 'helper';
// import { apiReturnInterface } from 'types';

export const processError = (err: any) => {
  const error = err as AxiosError<any>;
  if (error?.response?.data?.message) {
    const e = error?.response?.data?.message;
    if (e.includes('Missing or insufficient permissions')) return;
    toast.error(error?.response?.data?.message);
  } else {
    if (error?.message.includes('Missing or insufficient permissions')) return;
    toast.error(error?.message || `An error occurred`);
  }
};
