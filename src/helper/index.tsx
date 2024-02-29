import toast from 'react-hot-toast';
export default toast;
export function firstCharsOfWords(str: string) {
  const words = str.split(' ');

  if (words.length === 1 && words[0].length > 1) {
    const word = words[0];
    return word[0] + word[word.length - 1];
  }

  return words.map((word) => word[0]).join('');
}
export const copyToClipboard = (text: string, alert: any) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      toast.success(alert);
    })
    .catch(() => {
      toast.error(`An Error occurred while copying`);
    });
};

interface nullTextCheckerInterfac {
  text?: any;
  returnValue?: 'n/a' | 'empty';
}

export const nullTextChecker = ({ text, returnValue = 'n/a' }: nullTextCheckerInterfac) => {
  if (text) {
    return text;
  } else {
    return returnValue === 'n/a' ? 'n/a' : '';
  }
};

export const ensureIsNumber = (i: any) => {
  return isNaN(i) || !i ? 0 : parseInt(`${i}`);
};

export const undefinedNumberChecker = (i?: number) => {
  if (i) {
    return i;
  } else {
    return 0;
  }
};

export const shortNumber = (i: string, withDecimal?: boolean) => {
  if (i) {
    const num = parseFloat?.(i);
    if (num >= 1000000) {
      return withDecimal ? `${(num / 1000000).toFixed(2)}M` : `${num / 1000000}M`;
    } else if (num >= 1000) {
      return withDecimal ? `${(num / 1000).toFixed(2)}K` : `${num / 1000}K`;
    } else {
      return withDecimal ? num.toFixed(2) : num;
    }
  }
};

export const checkIfEmail = (str: string) => {
  const regexExp =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;

  return regexExp.test(str);
};

export function filterStringsContainingDoc(strings: string[]): string[] {
  return strings?.filter((str) => str?.includes('.doc'));
}

export function filterStringsContainingImageExtensions(strings: string[]): string[] {
  return strings?.filter((str) => str?.includes('.png') || str.includes('.jpg'));
}
function getCurrentDateTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const day = now.getDate();
  const month = now.toLocaleString('default', { month: 'short' }); // Get month name in short form
  const year = now.getFullYear();

  // Format hours for AM/PM
  const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12AM
  const ampm = hours < 12 ? 'am' : 'pm';

  // Format minutes to always be two digits
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

  // Construct the formatted date string
  const formattedDate = `${formattedHours}:${formattedMinutes}${ampm}, ${day}th ${month} ${year}`;

  return formattedDate;
}
export function generateCouponCode(couponName: string): string {
  // Remove non-alphanumeric characters and convert to uppercase
  const sanitizedCouponName = couponName.replace(/\W/g, '').toUpperCase();

  // Get current timestamp
  const timestamp = Date.now();

  // Combine sanitized coupon name and timestamp
  const couponCode = `${sanitizedCouponName}_${timestamp}`;

  return couponCode;
}
