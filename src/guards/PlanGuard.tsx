import CONSTANTS from 'constant';
import usePlan from 'hooks/business-logic/usePlan';
import { useMemo } from 'react';
import useStore from 'store';
import { routePathTypes } from 'types';
import Icon from 'utils/Icon';

interface IPlanGuard {
  page: routePathTypes;
  children: JSX.Element;
}

const PlanGuard = ({ children, page }: IPlanGuard) => {
  const currUserPlan = useStore((state) => state?.plan);
  const { isAllowed } = usePlan({ currUserPlan });

  const allowed = useMemo(() => {
    const pagePlan = CONSTANTS.PLAN_PERMISSIONS[page];
    return isAllowed(pagePlan);
  }, [isAllowed, page]);

  return allowed ? (
    children
  ) : (
    <section className='flex w-full flex-grow flex-col items-center justify-center gap-4'>
      <div>
        <Icon name='alienPlants' svgProp={{ className: 'max-w-full ' }} />
      </div>
      <p className='text-[14px] leading-[20px] tracking-[0.15px] text-primary-1'>
        Upgrade to the Nollywood {CONSTANTS.PLAN_PERMISSIONS[page]} plan to access this.
      </p>{' '}
    </section>
  );
};

export default PlanGuard;
