import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from 'components/shadcn/ui/alert-dialog';
import { Button } from 'components/shadcn/ui/button';
import { tr } from 'date-fns/locale';
import Icon from 'utils/Icon';
import { cn } from 'lib/utils';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from 'firebase';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'helper';
import Spinner from 'components/shadcn/ui/spinner';

export default function DeleteModal({
  btnText,
  title,
  description,
  action,
  cancel,
  documentId,
  collectionName,
  isArchive,
}: {
  btnText?: string;
  title?: string;
  description?: string;
  action?: string;
  cancel?: string;
  collectionName?: string;
  documentId?: string;
  isArchive?: boolean;
}) {
  const [isloading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  /**
   * Deletes a document from a specified Firestore collection.
   *
   * @param {string} collectionName The name of the collection containing the document to delete.
   * @param {string} documentId The ID of the document to delete.
   */

  async function handleAction(collectionName: string, documentId: string) {
    setIsLoading(true);
    try {
      if (isArchive) {
        await updateDoc(doc(db, collectionName, documentId), { isArchived: true });
        toast.success('Successfully archived');
      } else {
        await deleteDoc(doc(db, collectionName, documentId));
        toast.success('Successfully deleted');
      }
      navigate(-1);
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Error ${isArchive ? 'archiving' : 'deleting'} item`);
    }
    setIsLoading(false);
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {/* <Button
          variant='outline'
          className=' h-[3.15rem] w-[3.1rem] rounded-full  p-4 text-xl font-light shadow-md focus:border-none active:border-none'
        >
          x
        </Button> */}
        <Button
          variant='outline'
          className={cn(
            'flex w-full items-center justify-start gap-2 border-0 p-0 px-2 text-[0.71rem] capitalize disabled:cursor-not-allowed disabled:opacity-50',
            isArchive ? 'text-blue-500' : 'text-red-500',
          )}
        >
          <Icon name={isArchive ? 'archive' : 'trash'} svgProp={{ className: 'text-black' }}></Icon>
          <p>{btnText}</p>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className='bg-white'>
        <AlertDialogHeader className='flex flex-col items-center'>
          <AlertDialogTitle className='text-center capitalize'>{btnText}</AlertDialogTitle>
          {/* <AlertDialogDescription className='text-center text-gray-400'>
            Deleting this patient’s profile removes all the information for this patient completely
          </AlertDialogDescription> */}
          <AlertDialogDescription className={cn('text-center font-semibold', isArchive ? 'text-blue-600' : 'text-red-600')}>
            {isArchive ? 'This product will be hidden from the storefront.' : 'This action can not be reversed!'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='sm:justify-center'>
          <Button
            type='submit'
            disabled={isloading}
            className={cn('capitalize transition-all duration-150 ease-in-out md:px-8', isArchive ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700', isloading && 'cursor-not-allowed opacity-40')}
            onClick={() => {
              handleAction(collectionName || '', documentId || '');
            }}
          >
            {isloading ? <Spinner /> : btnText}
          </Button>
          <AlertDialogCancel className='md:px-8'>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
