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
  return moment(i).format('MMM D, YYYY');
};
export function getCreatedDateFromDocument(documentData: DocumentData): string {
  const createTime = documentData._document.createTime.timestamp;
  const createdDate = new Date(createTime.seconds * 1000); // Convert seconds to milliseconds
  return formatDate(createdDate.toDateString());
}
export const statusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'success':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-100';
    case 'en route':
      return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'delivered':
      return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-100';
  }
};

export const checkStatus = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'success':
      return 'text-emerald-600';
    case 'pending':
      return 'text-amber-500';
    case 'en route':
      return 'text-blue-600';
    case 'delivered':
      return 'text-indigo-600';
    default:
      return 'text-red-500';
  }
};
export function splitStringBySpaceAndReplaceWithDash(str: string): string {
  return str.trim().split(' ').join('-').toLowerCase();
}

export const formatToNaira = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace('NGN', '₦');
};


//? upload images asset-folder 
export async function uploadFile(file: File | Blob | string, type: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("cloud_name", "dbka31fuy");
  formData.append("upload_preset", "myfoodangels");
  formData.append("folder", "product_images");
  if (type === "video") {
    formData.append("resource_type", "video");
  } else if (type === "pdf") {
    formData.append("resource_type", "raw");
  } else if (type === "audio") {
    formData.append("resource_type", "audio");
  } else {
    formData.append("resource_type", "image");
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dbka31fuy/${
        type === "pdf" ? "raw" : type
      }/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (response.ok) {
      const data = await response.json();

      return data.secure_url;
    } else {
      console.error("Failed to upload image");
      return null;
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
}