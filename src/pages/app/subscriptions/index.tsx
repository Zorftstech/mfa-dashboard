import SubscriptionsTable from 'components/Tables/SubscriptionsTable/SubscriptionsTable';

const SubscriptionsPage = () => {
  return (
    <div className='container flex h-full w-full max-w-[180.75rem] flex-col px-container-base pb-[2.1rem] md:px-container-md'>
      <div className='mb-6'>
        <h3 className='text-base font-semibold md:text-2xl'>Subscribed Products</h3>
        <p className='text-[0.85rem] text-gray-500'>
          Monitor and manage recurring monthly product subscriptions
        </p>
      </div>
      <div className='relative grid w-full'>
        <SubscriptionsTable />
      </div>
    </div>
  );
};

export default SubscriptionsPage;
