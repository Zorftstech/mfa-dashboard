import FunkyPagesHero from 'components/general/FunkyPagesHero';
import PlanGuard from 'guards/PlanGuard';

const BillingPage = () => {
  return (
    <div className='container flex h-full w-full max-w-[180.75rem] flex-col gap-8 overflow-auto px-container-md pb-[2.1rem]'>
      {' '}
      <FunkyPagesHero
        // description='Access bi-annual bootcamps and register!'
        title='Products'
      />
      <div></div>
    </div>
  );
};
export default BillingPage;
