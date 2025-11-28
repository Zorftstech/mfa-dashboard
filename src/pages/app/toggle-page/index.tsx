import FunkyPagesHero from 'components/general/FunkyPagesHero';
import PillTabs from 'components/general/PillTabs';
import SearchComboBox from 'components/general/SearchComboBox';
import { useState } from 'react';
import MasterClassCard from 'components/general/MasterClassCard';
import filmImg from 'assets/image/masterClassImg.png';

import { useQuery } from '@tanstack/react-query';

import { processError } from 'helper/error';
import AnnouncementToggle from './annoucement';
import ShowSections from './showSections';
import AnnouncementsPage from './AnnouncementPage';
type filterTypes = 'All' | 'Upcoming' | 'Completed';

const generalFilters: filterTypes[] = ['All', 'Upcoming', 'Completed'];

const TogglePage = () => {
  const [currFilter, setCurrFilter] = useState<filterTypes>('All');

  return (
    <AnnouncementsPage/>
  );
};

export default TogglePage;
