import FunkyPagesHero from 'components/general/FunkyPagesHero';
import PlanGuard from 'guards/PlanGuard';

const OnlineTraining = () => {
  return (
    <div className='container flex w-full flex-col px-container-base py-[1.875rem]'>
      <FunkyPagesHero
        description='Online interactive sessions, where you can watch tutorials and ask questions'
        title='Online Training'
      />
    </div>
  );
};

export default OnlineTraining;
