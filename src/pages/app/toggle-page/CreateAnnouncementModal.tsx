import { Button } from 'components/shadcn/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormDescription,
  FormLabel,
} from 'components/shadcn/ui/form';
import { Input } from 'components/shadcn/input';
import { cn, splitStringBySpaceAndReplaceWithDash, uploadFile } from 'lib/utils';
import { Switch } from 'components/shadcn/switch';
import { doc, setDoc, collection, updateDoc, where, query, getDocs } from 'firebase/firestore';
import { db } from 'firebase';
import { Popover, PopoverContent, PopoverTrigger } from 'components/shadcn/popover';
import { CalendarIcon, Search, X } from 'lucide-react';
import { Calendar } from 'components/shadcn/ui/calendar';
import { format } from 'date-fns';
import { processError } from 'helper/error';
import { useEffect, useMemo, useState } from 'react';
import toast from 'helper';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from 'components/shadcn/ui/dialog';
import { useDropzone } from 'react-dropzone';
import Icon from 'utils/Icon';
import { Checkbox } from 'components/shadcn/ui/checkbox';
import { useQuery } from '@tanstack/react-query';

const FormSchema = z.object({
  categoryName: z.string().min(2, {
    message: 'Please enter a valid name',
  }),
  description: z.string().min(1, {
    message: 'Please enter a valid description',
  }),
  isActive: z.boolean(),
  availableDate: z.date({
    required_error: 'Available date is required',
  }),
  expiryDate: z.date({
    required_error: 'Expiry date is required',
  }),
});

interface Product {
  loystarId: number;
  name: string;
  image: string;
  price?: number;
  id: string;
}

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: any;
  isEditing?: boolean;
}

export default function CreateAnnouncementModal({
  isOpen,
  onClose,
  onSuccess,
  editData,
  isEditing = false,
}: CreateAnnouncementModalProps) {
  const [formIsLoading, setFormIsLoading] = useState(false);
  const [file, setFile] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(editData?.image || null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>(editData?.products || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);

  console.log(selectedProducts, 'erer', editData);

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['get-products'],
    queryFn: async () => {
      const productsRef = collection(db, 'newProducts');
      const querySnapshot = await getDocs(productsRef);

      const productsList: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.loystarId) {
          productsList.push({
            id: doc?.id,
            loystarId: data.loystarId,
            name: data.name || 'Unnamed Product',
            image: data.mainImage || data.image || '',
            price: data.price || 0,
          });
        }
      });
      return productsList;
    },
  });

  const handleFileDrop = async (files: any) => {
    setFile(files);
    const fileUrl = URL.createObjectURL(files);
    setImageUrl(fileUrl);
  };

  const onDrop = (acceptedFiles: any) => {
    handleFileDrop(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': [],
    },
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      categoryName: editData?.name || '',
      description: editData?.desc || '',
      isActive: editData?.isActive ?? true,
      availableDate: editData?.availableDate
        ? new Date(editData.availableDate.seconds * 1000)
        : new Date(),
      expiryDate: editData?.expiryDate ? new Date(editData.expiryDate.seconds * 1000) : new Date(),
    },
  });

  useEffect(() => {
    if (editData) {
      form.setValue('categoryName', editData?.name || '');
      form.setValue('description', editData?.desc || '');
      form.setValue('isActive', editData?.isActive ?? true);
      form.setValue(
        'availableDate',
        editData?.availableDate ? new Date(editData.availableDate.seconds * 1000) : new Date(),
      );
      form.setValue(
        'expiryDate',
        editData?.expiryDate ? new Date(editData.expiryDate.seconds * 1000) : new Date(),
      );
      setImageUrl(editData?.image);
      setSelectedProducts(editData?.products || []);
    }
  }, [editData]);

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  };

  const removeProduct = (productId: number) => {
    setSelectedProducts((prev) => prev.filter((id) => id !== productId));
  };

  const getSelectedProductDetails = () => {
    return products.filter((product) => selectedProducts.includes(product.loystarId));
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setFormIsLoading(true);
    let downloadURL = imageUrl;

    try {
      if (!isEditing) {
        const categoriesRef = collection(db, 'categories');
        const q = query(categoriesRef, where('name', '==', data.categoryName));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          toast.error('Category name already exists!');
          return setFormIsLoading(false);
        }
      }

      // Upload image if new file is selected
      if (file) {
        downloadURL = await uploadFile(file, 'image');
      }

      if (!downloadURL && !isEditing) {
        toast.error('Image is required.');
        setFormIsLoading(false);
        return;
      }

      const announcementData = {
        name: data.categoryName,
        desc: data.description,
        image: downloadURL || editData?.image,
        slug: splitStringBySpaceAndReplaceWithDash(data.categoryName),
        loystarId: isEditing ? editData.loystarId : new Date().getMilliseconds(),
        isAnnouncement: true,
        isActive: data.isActive,
        availableDate: data.availableDate,
        expiryDate: data.expiryDate,
        products: selectedProducts,

        updatedAt: new Date(),
      };

      if (isEditing && editData?.id) {
        const docRef = doc(db, 'categories', editData.id);
        await updateDoc(docRef, announcementData);
        toast.success('Announcement updated successfully');
      } else {
        const collectionRef = collection(db, 'categories');
        const docRef = doc(collectionRef);
        await setDoc(docRef, { ...announcementData, createdAt: new Date() });
        toast.success('Announcement created successfully');
      }

      form.reset();
      setImageUrl(null);
      setFile(null);
      setSelectedProducts([]);
      onSuccess();
      onClose();
    } catch (error) {
      processError(error);
      toast.error('An error occurred, please try again.');
    } finally {
      setFormIsLoading(false);
    }
  }

  const selectedProductDetails = useMemo(() => {
    return getSelectedProductDetails();
  }, [selectedProducts]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto bg-white'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Announcement' : 'Create New Announcement'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the announcement details and scheduling'
              : 'Create a new announcement bar that will appear on your website'}
          </DialogDescription>
        </DialogHeader>

        <div className='mb-6 flex items-start justify-between gap-6'>
          <section className='flex-shrink-0 rounded-xl'>
            <section {...getRootProps()}>
              <input {...getInputProps()} />
              {imageUrl ? (
                <div className='relative h-[8rem] w-[8rem] rounded-full hover:cursor-pointer'>
                  <img
                    src={imageUrl}
                    alt='Selected'
                    className='h-full w-full rounded-full object-cover object-center'
                  />
                  <div className='absolute bottom-[5%] right-0 h-fit rounded-full bg-slate-100 p-2'>
                    <Icon name='Camera' svgProp={{ className: 'w-4 h-4' }} />
                  </div>
                </div>
              ) : isDragActive ? (
                <p>Drop the files here ...</p>
              ) : (
                <div className='flex items-center justify-center gap-3 rounded-full border-2 border-dashed bg-gray-100 px-10 py-8 outline-dashed outline-2 outline-gray-500 hover:cursor-pointer'>
                  <Icon name='Camera' svgProp={{ className: 'w-8' }} />
                </div>
              )}
            </section>
          </section>

          {/* Selected Products Preview */}
          {selectedProductDetails.length > 0 && (
            <div className='flex-1'>
              <h4 className='mb-2 text-sm font-medium'>
                Selected Products ({selectedProductDetails.length})
              </h4>
              <div className='flex max-h-32 flex-wrap gap-2 overflow-y-auto'>
                {selectedProductDetails.map((product) => (
                  <div
                    key={product.id}
                    className='flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs'
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className='h-6 w-6 rounded-full object-cover'
                    />
                    <span className='max-w-[100px] truncate'>{product.name}</span>
                    <button
                      type='button'
                      onClick={() => removeProduct(product.loystarId)}
                      className='text-gray-500 hover:text-red-500'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn(
              'flex flex-col gap-6',
              formIsLoading && 'pointer-events-none cursor-not-allowed opacity-30',
            )}
          >
            <div className='grid grid-cols-1 gap-6'>
              <FormField
                control={form.control}
                name='categoryName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Announcement Name</FormLabel>
                    <FormControl>
                      <Input
                        className='py-4'
                        {...field}
                        type='text'
                        placeholder='Enter announcement name'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        className='py-4'
                        {...field}
                        type='text'
                        placeholder='Enter announcement description'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Product Selection Section */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <FormLabel>Products</FormLabel>
                  <span className='text-sm text-gray-500'>
                    {selectedProducts.length} product(s) selected
                  </span>
                </div>

                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsProductSelectorOpen(true)}
                  className='w-full justify-start'
                >
                  <Search className='mr-2 h-4 w-4' />
                  Select Products
                </Button>

                {/* Product Selection Modal */}
                <Dialog open={isProductSelectorOpen} onOpenChange={setIsProductSelectorOpen}>
                  <DialogContent className='flex max-h-[80vh] max-w-3xl flex-col overflow-hidden bg-white'>
                    <DialogHeader>
                      <DialogTitle>Select Products</DialogTitle>
                      <DialogDescription>
                        Choose products to feature in this announcement
                      </DialogDescription>
                    </DialogHeader>

                    {/* Search */}
                    <div className='relative'>
                      <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                      <Input
                        placeholder='Search products...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='pl-10'
                      />
                    </div>

                    {/* Products Grid */}
                    <div className='flex-1 overflow-y-auto'>
                      {productsLoading ? (
                        <div className='flex justify-center py-8'>
                          <div className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
                        </div>
                      ) : filteredProducts.length === 0 ? (
                        <div className='py-8 text-center text-gray-500'>No products found</div>
                      ) : (
                        <div className='grid grid-cols-1 gap-4 py-4 md:grid-cols-2'>
                          {filteredProducts.map((product) => (
                            <div
                              key={product.id}
                              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                                selectedProducts.includes(product.loystarId)
                                  ? 'border-primary bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => toggleProductSelection(product.loystarId)}
                            >
                              <Checkbox
                                checked={selectedProducts.includes(product.loystarId)}
                                onCheckedChange={() => toggleProductSelection(product.loystarId)}
                              />
                              <img
                                src={product.image}
                                alt={product.name}
                                className='h-12 w-12 flex-shrink-0 rounded object-cover'
                              />
                              <div className='min-w-0 flex-1'>
                                <p className='truncate text-sm font-medium'>{product.name}</p>
                                {product.price && (
                                  <p className='text-xs text-gray-500'>N{product.price}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className='flex justify-end gap-3 border-t pt-4'>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => setIsProductSelectorOpen(false)}
                      >
                        Done
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='availableDate'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>Available From</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                              <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='expiryDate'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>Expiry Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                              <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='isActive'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>Active Status</FormLabel>
                      <FormDescription>Enable or disable this announcement</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className='flex justify-end gap-3 pt-4'>
              <Button type='button' variant='outline' onClick={onClose} disabled={formIsLoading}>
                Cancel
              </Button>
              <Button type='submit' disabled={formIsLoading} className='min-w-[120px] bg-primary-1'>
                {formIsLoading ? (
                  <div className='flex items-center gap-2'>
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                    Saving...
                  </div>
                ) : isEditing ? (
                  'Update Announcement'
                ) : (
                  'Create Announcement'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
