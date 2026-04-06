import * as React from 'react';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import moment from 'moment';

import { cn } from 'lib/utils';
import { Button } from 'components/shadcn/ui/button';
import { Calendar } from 'components/shadcn/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from 'components/shadcn/ui/popover';

export type Timeframe = 'today' | 'week' | 'month' | 'year' | 'all' | 'custom';

interface DateRangePickerProps {
  className?: string;
  onRangeChange: (range: { start: Date | null; end: Date | null }) => void;
  defaultTimeframe?: Timeframe;
}

export function DateRangePicker({
  className,
  onRangeChange,
  defaultTimeframe = 'all',
}: DateRangePickerProps) {
  const [timeframe, setTimeframe] = React.useState<Timeframe>(defaultTimeframe);
  const [date, setDate] = React.useState<DateRange | undefined>();

  const handleTimeframeChange = (newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe);
    let start: Date | null = null;
    let end: Date | null = new Date();

    switch (newTimeframe) {
      case 'today':
        start = moment().startOf('day').toDate();
        break;
      case 'week':
        start = moment().subtract(7, 'days').startOf('day').toDate();
        break;
      case 'month':
        start = moment().subtract(30, 'days').startOf('day').toDate();
        break;
      case 'year':
        start = moment().subtract(1, 'years').startOf('day').toDate();
        break;
      case 'all':
        start = null;
        end = null;
        break;
      case 'custom':
        return; // Don't trigger change yet, wait for calendar selection
    }

    onRangeChange({ start, end });
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    setDate(range);
    if (range?.from && range?.to) {
      onRangeChange({ start: range.from, end: range.to });
    }
  };

  const getTimeframeLabel = (tf: Timeframe) => {
    switch (tf) {
      case 'today': return 'Today';
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      case 'year': return 'Last Year';
      case 'all': return 'All Time';
      case 'custom': return 'Custom Range';
    }
  };

  const displayDate = React.useMemo(() => {
    if (timeframe !== 'custom') return getTimeframeLabel(timeframe);
    if (date?.from) {
      if (date.to) {
        return `${moment(date.from).format('MMM D, YYYY')} - ${moment(date.to).format('MMM D, YYYY')}`;
      }
      return moment(date.from).format('MMM D, YYYY');
    }
    return 'Pick a date';
  }, [date, timeframe]);

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id='date'
            variant={'outline'}
            className={cn(
              'w-[280px] justify-between text-left font-normal shadow-sm h-11 border-gray-200 hover:bg-gray-50 transition-colors',
              !date && 'text-muted-foreground',
            )}
          >
            <div className='flex items-center gap-2'>
              <CalendarIcon className='mr-2 h-4 w-4 text-primary-1' />
              <span>{displayDate}</span>
            </div>
            <ChevronDown className='h-4 w-4 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='end'>
          <div className='flex flex-col md:flex-row'>
            <div className='flex flex-col border-r p-2'>
              {(['today', 'week', 'month', 'year', 'all', 'custom'] as Timeframe[]).map((tf) => (
                <Button
                  key={tf}
                  variant='ghost'
                  className={cn(
                    'justify-start font-normal px-4 py-2 h-9 rounded-md',
                    timeframe === tf && 'bg-primary-1/10 text-primary-1 font-semibold',
                  )}
                  onClick={() => handleTimeframeChange(tf)}
                >
                  {getTimeframeLabel(tf)}
                </Button>
              ))}
            </div>
            {timeframe === 'custom' && (
              <Calendar
                initialFocus
                mode='range'
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                className='p-3'
              />
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
