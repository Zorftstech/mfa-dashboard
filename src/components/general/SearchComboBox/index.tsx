import Icon from 'utils/Icon';

const SearchComboBox = () => {
  return (
    <div className='w-full rounded-[12px] border bg-white px-[1rem]   shadow-sm'>
      <div className='flex h-full  items-center'>
        <Icon name='searchIcon' svgProp={{ className: 'text-primary-9 w-4' }} />
        <div className='flex-grow'>
          <input
            className='form-input w-full border-0 placeholder:text-xs placeholder:text-textColor-disabled focus:!ring-0'
            placeholder='Search'
          />
        </div>
      </div>
    </div>
  );
};

export default SearchComboBox;
