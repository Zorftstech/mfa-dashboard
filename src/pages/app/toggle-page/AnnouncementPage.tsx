import FunkyPagesHero from 'components/general/FunkyPagesHero';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { processError } from 'helper/error';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from 'firebase';
import { getCreatedDateFromDocument } from 'lib/utils';
import { Button } from 'components/shadcn/ui/button';
import Icon from 'utils/Icon';
import { Switch } from 'components/shadcn/switch';
import { updateDoc } from 'firebase/firestore';
import toast from 'helper';
import { format } from 'date-fns';
import CreateAnnouncementModal from './CreateAnnouncementModal';
import DeleteModal from './DeleteModal';

interface Announcement {
  id: string;
  name: string;
  desc: string;
  image: string;
  isActive: boolean;
  isAnnouncement: boolean;
  availableDate: any;
  expiryDate: any;
  createdDate: string;
  products: any;
  loystarId: number;
}

export default function AnnouncementsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<Announcement | null>(null);

  async function fetchAnnouncements() {
    const categoriesRef = collection(db, 'categories');
    const querySnapshot = await getDocs(categoriesRef);

    const announcements: Announcement[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.isAnnouncement) {
        const createdDate = getCreatedDateFromDocument(doc as any);
        announcements.push({
          id: doc.id,
          name: data.name,
          desc: data.desc,
          image: data.image,
          isActive: data.isActive,
          isAnnouncement: data.isAnnouncement,
          availableDate: data.availableDate,
          expiryDate: data.expiryDate,
          products: data?.products,
          loystarId: data?.loystarId,
          createdDate,
        });
      }
    });

    return announcements.sort(
      (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
    );
  }

  const {
    data: announcements = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['get-announcements'],
    queryFn: fetchAnnouncements,
    onError: (err) => {
      processError(err);
    },
  });

  const handleToggleActive = async (announcement: Announcement) => {
    try {
      const docRef = doc(db, 'categories', announcement.id);
      await updateDoc(docRef, {
        isActive: !announcement.isActive,
        updatedAt: new Date(),
      });
      toast.success(
        `Announcement ${!announcement.isActive ? 'activated' : 'deactivated'} successfully`,
      );
      refetch();
    } catch (error) {
      processError(error);
      toast.error('Failed to update announcement status');
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);

    setIsCreateModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingAnnouncement) return;

    try {
      await deleteDoc(doc(db, 'categories', deletingAnnouncement.id));
      toast.success('Announcement deleted successfully');
      setDeletingAnnouncement(null);
      refetch();
    } catch (error) {
      processError(error);
      toast.error('Failed to delete announcement');
    }
  };

  const handleModalClose = () => {
    setEditingAnnouncement(null);
    setIsCreateModalOpen(false);
   
  };

  const handleSuccess = () => {
    refetch();
  };

  const formatFirebaseDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return format(date, 'MMM dd, yyyy');
  };

  const getStatus = (announcement: Announcement) => {
    const now = new Date();
    const availableDate = new Date(announcement.availableDate.seconds * 1000);
    const expiryDate = new Date(announcement.expiryDate.seconds * 1000);

    if (!announcement.isActive) return 'Inactive';
    if (now < availableDate) return 'Scheduled';
    if (now > expiryDate) return 'Expired';
    return 'Active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='container flex h-full w-full max-w-[180.75rem] flex-col gap-8 px-container-base pb-[2.1rem] md:px-container-md'>
      <div className='flex items-center justify-between'>
        <FunkyPagesHero
          description='Manage announcement bars that appear on your website'
          title='Announcement Bars'
        />
      </div>

      {announcements?.length > 0 && (
        <div className='flex w-full items-center justify-between'>
          <h2 className='text-lg font-bold'>Announcements</h2>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className='flex items-center gap-2 bg-primary-1'
          >
            Create Announcement
          </Button>
        </div>
      )}

      {/* Announcements List */}
      <div className='rounded-lg border bg-white'>
        {isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className='py-12 text-center'>
            <Icon
              name='missionDesignAsset2'
              svgProp={{ className: 'w-12 h-12 mx-auto text-gray-400' }}
            />
            <h3 className='mt-4 text-lg font-semibold'>No announcements</h3>
            <p className='mt-2 text-gray-500'>
              Get started by creating your first announcement bar
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)} className='mt-4 bg-primary-1'>
              Create Announcement
            </Button>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b bg-gray-50'>
                  <th className='p-4 text-left font-semibold'>Image</th>
                  <th className='p-4 text-left font-semibold'>Name</th>
                  <th className='p-4 text-left font-semibold'>Description</th>
                  <th className='p-4 text-left font-semibold'>Schedule</th>
                  <th className='p-4 text-left font-semibold'>Status</th>
                  <th className='p-4 text-left font-semibold'>Active</th>
                  <th className='p-4 text-left font-semibold'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((announcement) => {
                  const status = getStatus(announcement);
                  return (
                    <tr key={announcement.id} className='border-b hover:bg-gray-50'>
                      <td className='p-4'>
                        <img
                          src={announcement.image}
                          alt={announcement.name}
                          className='h-12 w-12 rounded object-cover'
                        />
                      </td>
                      <td className='p-4 font-medium'>{announcement.name}</td>
                      <td className='max-w-[200px] truncate p-4 text-sm text-gray-600'>
                        {announcement.desc}
                      </td>
                      <td className='p-4 text-sm'>
                        <div>From: {formatFirebaseDate(announcement.availableDate)}</div>
                        <div>To: {formatFirebaseDate(announcement.expiryDate)}</div>
                      </td>
                      <td className='p-4'>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                            status,
                          )}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className='p-4'>
                        <Switch
                          checked={announcement.isActive}
                          onCheckedChange={() => handleToggleActive(announcement)}
                        />
                      </td>
                      <td className='p-4'>
                        <div className='flex items-center gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleEdit(announcement)}
                          >
                            <Icon name='editPen' svgProp={{ className: 'w-4 h-4' }} />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setDeletingAnnouncement(announcement)}
                            className='text-red-600 hover:text-red-700'
                          >
                            <Icon name='trash' svgProp={{ className: 'w-4 h-4' }} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <CreateAnnouncementModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
        editData={editingAnnouncement}
        isEditing={!!editingAnnouncement}
      />

      {/* Delete Confirmation Modal */}
      {deletingAnnouncement && (
        <DeleteModal
          isOpen={!!deletingAnnouncement}
          onClose={() => setDeletingAnnouncement(null)}
          onConfirm={handleDelete}
          title='Delete Announcement'
          description={`Are you sure you want to delete "${deletingAnnouncement.name}"? This action cannot be undone.`}
        />
      )}
    </div>
  );
}
