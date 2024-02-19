import PlanGuard from 'guards/PlanGuard';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Icon from 'utils/Icon';
import { shimmer, toBase64 } from 'utils/general/shimmer';
import image from 'assets/image/dashboardAdSample.png';
import ProfileCard from 'components/general/ProfileCard';
import DemoDp from 'assets/image/demoDp.jpg';

type viewTypes = 'All' | 'Create' | 'View';
interface ComponentProps {
  setCurrentView: React.Dispatch<React.SetStateAction<viewTypes>>;
}

const ViewAds = ({ setCurrentView }: ComponentProps) => {
  return (
    <div className='container flex w-full flex-col px-container-base py-[1.875rem]'>
      <div>
        <div className='mb-6 flex items-start justify-between'>
          <button
            className=' group  mb-4 flex items-center justify-center gap-2 rounded-[15px] transition-all duration-300 ease-in-out hover:opacity-90'
            onClick={() => setCurrentView('All')}
          >
            <Icon
              name='arrowBack'
              svgProp={{
                className:
                  ' bg-white rounded-2xl text-gray-600 px-1 cursor-pointer hover:opacity-95 transition-opacity duration-300 ease-in-out active:opacity-100',
              }}
            />
            <span className='text-sm font-[500] leading-[24px] tracking-[0.4px] text-gray-600'>
              {' '}
              Go Back
            </span>
          </button>
        </div>
        <section className=' items-center rounded-md bg-white py-4 pb-[7rem]'>
          <div className=' flex w-full flex-wrap items-center justify-between border-b border-gray-200 px-5 py-4 md:px-8'>
            <p className='text-[16px] font-semibold text-gray-700 md:text-[18px] lg:text-[20px]'>
              We’re looking for an Experienced Animator!
            </p>
            <button className='group mr-3 mt-3 flex w-max items-center justify-center gap-2 rounded-[8px] border border-primary-1 bg-white px-[1.1rem] py-[0.3rem] transition-all duration-300 ease-in-out hover:bg-purple-100 hover:opacity-90 md:mt-0 md:px-[1.5rem]'>
              <span className='text-[13px] leading-[28px] tracking-[0.15px] text-primary-1 md:text-[14px] lg:text-[16px]'>
                Actions
              </span>
              <span className='fill-primary-1'>
                <Icon name='chervonDown' />
              </span>
            </button>
          </div>

          <div className='mt-8 grid grid-cols-1 gap-4 px-5 md:grid-cols-2 md:px-8 lg:grid-cols-3'>
            <div className='col-span-3 mt-16 flex flex-col lg:col-span-2 lg:mt-0'>
              <span className='mb-7'>
                <p className='text-[14px] font-semibold text-gray-600 md:text-[15px] lg:text-[16px]'>
                  Job Overview
                </p>
                <p className='mt-1 text-[13px] text-gray-400 md:text-[13px] lg:text-[14px]'>
                  We are seeking a talented Animator to join our team and help bring our creative
                  vision to life through animation. The successful candidate will be responsible for
                  designing and creating high-quality animations for a variety of projects,
                  including video games, films, and advertisements. The ideal candidate should have
                  a strong portfolio of previous work, be proficient in animation software, and have
                  a keen eye for detail.
                </p>
              </span>
              <span className='mb-7'>
                <p className='text-[14px] font-semibold text-gray-600 md:text-[15px] lg:text-[16px]'>
                  Job Categories
                </p>
                <p className='mt-1 text-[13px] text-gray-400 md:text-[13px] lg:text-[14px]'>
                  We are seeking a talented Animator to join our team and help bring our creative
                  vision to life through animation. The successful candidate will be responsible for
                  designing and creating high-quality animations for a variety of projects,
                  including video games, films, and advertisements. The ideal candidate should have
                  a strong portfolio of previous work, be proficient in animation software, and have
                  a keen eye for detail.
                </p>
              </span>
              <span className='mb-7'>
                <p className='text-[14px] font-semibold text-gray-600 md:text-[15px] lg:text-[16px]'>
                  Duration
                </p>
                <p className='mt-1 text-[13px] text-gray-400 md:text-[13px] lg:text-[14px]'>
                  3 weeks
                </p>
              </span>
              <span className='mb-7'>
                <p className='text-[14px] font-semibold text-gray-600 md:text-[15px] lg:text-[16px]'>
                  Benefit
                </p>
                <div className='mb-5 mt-1 mt-4 flex flex-wrap gap-x-3 text-[13px] text-gray-400 md:text-[13px] lg:text-[14px]'>
                  <span className='mb-2 flex w-max items-center justify-center rounded-md bg-primary-light px-3 py-2 text-[12px] text-gray-600 md:text-[13px] lg:text-[14px]'>
                    <Icon name='tag' />
                    <p className='ms-2 pt-[2px]'>Pay: $10 000</p>
                  </span>
                  <span className='mb-2 flex w-max items-center justify-center rounded-md bg-primary-light px-3 py-2 text-[12px] text-gray-600 md:text-[13px] lg:text-[14px]'>
                    <Icon name='tag' />
                    <p className='ms-2 pt-[2px]'>duration: 3 weeks</p>
                  </span>
                </div>
                <ul className='mt-1 mt-5 list-disc px-4 text-[13px] text-gray-400 md:text-[13px] lg:text-[14px]'>
                  <li>
                    Design and create high-quality animations for a variety of projects, including
                    video games, films, and advertisements
                  </li>
                  <li>
                    Collaborate with other team members to develop and refine concepts and ideas
                  </li>
                  <li>
                    Ensure animations meet project deadlines and adhere to the project's creative
                    direction
                  </li>
                </ul>
              </span>
              <span className='mb-7'>
                <p className='text-[14px] font-semibold text-gray-600 md:text-[15px] lg:text-[16px]'>
                  Responsibilities
                </p>

                <ul className='mt-1 mt-2 list-disc px-4 text-[13px] text-gray-400 md:text-[13px] lg:text-[14px]'>
                  <li>
                    Design and create high-quality animations for a variety of projects, including
                    video games, films, and advertisements
                  </li>
                  <li>
                    Collaborate with other team members to develop and refine concepts and ideas
                  </li>
                  <li>
                    Ensure animations meet project deadlines and adhere to the project's creative
                    direction
                  </li>
                  <li>
                    Communicate with clients or stakeholders to ensure their needs are met and their
                    feedback is incorporated into the final product
                  </li>
                  <li>
                    Stay up to date with the latest animation techniques and software to ensure the
                    highest level of quality in work produced.
                  </li>
                </ul>
              </span>
              <span className='mb-7'>
                <p className='text-[14px] font-semibold text-gray-600 md:text-[15px] lg:text-[16px]'>
                  Requirements
                </p>
                <ul className='mt-1 mt-2 list-disc px-4 text-[13px] text-gray-400 md:text-[13px] lg:text-[14px]'>
                  <li>Bachelor's degree in Animation, Fine Arts, or a related field</li>
                  <li>
                    Proficient in animation software such as Adobe After Effects, Maya, or Blender
                  </li>
                  <li>Strong portfolio showcasing previous work in animation</li>
                  <li>Excellent attention to detail</li>
                  <li>Ability to work well in a team environment</li>
                  <li>Strong communication and time management skills</li>
                </ul>
              </span>
            </div>
            <div className='col-end-3 row-start-1 flex justify-end md:col-start-1 md:col-end-2 lg:col-start-3 lg:col-end-3'>
              <div className='flex h-[14.5rem] w-[16rem] flex-col items-end md:h-[17.5rem] md:w-[17.5rem]'>
                <div className=''>
                  <div
                    className='relative mb-[1rem] h-[14.5rem] w-[16rem] cursor-cardCursor overflow-hidden rounded-[8px] border-b-4 border-b-warning-1 transition-all duration-300
                                        ease-in-out after:absolute after:left-0 after:top-0 after:h-full after:w-full after:bg-transparent after:transition-all after:duration-300 hover:after:bg-black/40 md:h-[17.5rem] md:w-[17.5rem]
                                        '
                  >
                    <LazyLoadImage
                      placeholderSrc={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                      src={image}
                      alt=''
                      className='group h-full w-full origin-center transform bg-cover bg-top object-cover transition-transform duration-300 ease-in-out group-hover:scale-125'
                    />
                    <div className='absolute top-0 flex h-[14.5rem] w-[16rem] items-center justify-center bg-black opacity-50 md:h-[17.5rem] md:w-[17.5rem]'>
                      <Icon
                        name='editPen'
                        svgProp={{
                          className: 'fill-white font-bold h-[40px] w-[40px] opacity-100',
                        }}
                      />
                    </div>
                  </div>
                </div>
                <button className='group flex w-full items-center justify-center gap-2 rounded-[8px] bg-primary-1 px-[1.1rem] py-[0.3rem] transition-opacity duration-300 ease-in-out hover:opacity-90 md:px-[1.5rem]'>
                  <span className='text-[13px] leading-[28px] tracking-[0.15px] text-white md:text-[14px] lg:text-[16px]'>
                    SAVE CHANGES
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className=' flex flex-col px-5 md:px-8'>
            <span className='mb-4 flex items-center gap-x-2'>
              <Icon name='awardStarIcon' />
              <p className='text-[14px] font-semibold text-primary-1 md:text-[15px] lg:text-[16px]'>
                Potentials
              </p>
            </span>
            <div className='flex grid w-[100%] grid-cols-1 flex-wrap items-center justify-center gap-x-[1%] gap-y-[1%] md:grid-cols-2 lg:grid-cols-4'>
              {[...Array(4)]?.map((_, i) => (
                <ProfileCard key={i} role='UI designer' name='Mark Gilbert' imgSrc={DemoDp} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ViewAds;
