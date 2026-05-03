import React, { useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from 'firebase';
import { useQuery } from '@tanstack/react-query';
import FeaturedLoader from 'components/Loaders/FeaturedLoader';
import { formatToNaira, formatCurrentDateTime } from 'helper';
import PillTabs from 'components/general/PillTabs';

const ReferralsPage = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  // Fetch Users with Referral Info
  const fetchReferralOverview = async () => {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    const users: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.referralCode) {
        users.push({
          id: doc.id,
          ...data,
        });
      }
    });
    return users;
  };

  // Fetch Referral History (Payouts)
  const fetchReferralHistory = async () => {
    const historyRef = collection(db, 'referralHistory');
    const q = query(historyRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    const history: any[] = [];
    querySnapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return history;
  };

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['referralOverview'],
    queryFn: fetchReferralOverview,
  });

  const { data: history, isLoading: loadingHistory } = useQuery({
    queryKey: ['referralHistory'],
    queryFn: fetchReferralHistory,
  });

  return (
    <div className='container flex w-full max-w-[180.75rem] flex-col gap-6 px-container-base pb-[2.1rem] md:px-container-md'>
      <div className='justify-between md:flex'>
        <div>
          <h3 className='mb-4 text-base font-semibold md:text-2xl'>Referral Management</h3>
          <p className='hidden text-[0.85rem] md:block'>
            Monitor user referral activity and rewards.
          </p>
        </div>
        <div>
          <p className='mb-6 hidden text-end text-[0.75rem] text-gray-400 md:block'>
            {formatCurrentDateTime()}
          </p>
        </div>
      </div>

      <PillTabs
        tabs={['Overview', 'Payout History']}
        currActive={activeTab}
        onSelect={setActiveTab}
      />

      {activeTab === 'Overview' ? (
        <FeaturedLoader isLoading={loadingUsers}>
          <div className='overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm'>
            <table className='w-full text-left text-sm'>
              <thead className='bg-gray-50 text-xs uppercase text-gray-700'>
                <tr>
                  <th className='px-6 py-4 font-semibold'>User</th>
                  <th className='px-6 py-4 font-semibold'>Referral Code</th>
                  <th className='px-6 py-4 font-semibold'>Referral Balance</th>
                  <th className='px-6 py-4 font-semibold'>Referred By</th>
                  <th className='px-6 py-4 font-semibold'>Status</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {users?.map((user: any) => (
                  <tr key={user.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4'>
                      <div className='font-medium text-gray-900'>{user.displayName}</div>
                      <div className='text-gray-500'>{user.email}</div>
                    </td>
                    <td className='px-6 py-4'>
                      <span className='rounded bg-blue-50 px-2 py-1 font-mono text-blue-700'>
                        {user.referralCode}
                      </span>
                    </td>
                    <td className='px-6 py-4 font-semibold text-green-600'>
                      {formatToNaira(user.referralBalance || 0)}
                    </td>
                    <td className='px-6 py-4 text-gray-500'>
                      {user.referredBy || 'Direct'}
                    </td>
                    <td className='px-6 py-4'>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${user.hasUsedReferral ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.hasUsedReferral ? 'Discount Used' : 'New User'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FeaturedLoader>
      ) : (
        <FeaturedLoader isLoading={loadingHistory}>
          <div className='overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm'>
            <table className='w-full text-left text-sm'>
              <thead className='bg-gray-50 text-xs uppercase text-gray-700'>
                <tr>
                  <th className='px-6 py-4 font-semibold'>Date</th>
                  <th className='px-6 py-4 font-semibold'>Referee (Earner)</th>
                  <th className='px-6 py-4 font-semibold'>Friend (Customer)</th>
                  <th className='px-6 py-4 font-semibold'>Reward Amount</th>
                  <th className='px-6 py-4 font-semibold'>Order ID</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {history?.map((item: any) => (
                  <tr key={item.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 text-gray-600'>
                      {item.timestamp ? new Date(item.timestamp.seconds * 1000).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className='px-6 py-4 font-medium text-gray-900'>{item.refereeName}</td>
                    <td className='px-6 py-4 text-gray-600'>{item.friendName}</td>
                    <td className='px-6 py-4 font-semibold text-green-600'>
                      {formatToNaira(item.rewardAmount)}
                    </td>
                    <td className='px-6 py-4 text-gray-500 text-xs font-mono'>{item.orderId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FeaturedLoader>
      )}
    </div>
  );
};

export default ReferralsPage;
