import FunkyPagesHero from 'components/general/FunkyPagesHero';
import PlanGuard from 'guards/PlanGuard';

const FoodBundles = () => {
  return (
    <div className='container flex h-full w-full max-w-[180.75rem] flex-col gap-8 overflow-auto px-container-md pb-[2.1rem]'>
      <FunkyPagesHero
        // description='Would you like to consult with Anthill Studios for a Project?!'
        title='Food Bundles'
      />
    </div>
  );
};

export default FoodBundles;
