import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export const useGroupDetails = (groupId: string | undefined) => {
  return useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      if (!groupId) return null;

      // 1. Fetch group details
      const groupDoc = await getDoc(doc(db, 'groups', groupId));
      if (!groupDoc.exists()) throw new Error('Group not found');
      const groupData = { id: groupDoc.id, ...groupDoc.data() };

      // 2. Fetch members from top-level collection
      const membersQuery = query(
        collection(db, 'group_members'),
        where('group_id', '==', groupId)
      );
      const membersSnapshot = await getDocs(membersQuery);
      const members = await Promise.all(
        membersSnapshot.docs.map(async (mDoc) => {
          const mData = mDoc.data();
          const uDoc = await getDoc(doc(db, 'users', mData.user_id));
          return { id: mDoc.id, ...mData, user: uDoc.exists() ? uDoc.data() : null };
        })
      );

      // 3. Fetch expenses and their splits
      const expensesQuery = query(
        collection(db, 'groups', groupId, 'expenses'),
        orderBy('date', 'desc')
      );
      const expensesSnapshot = await getDocs(expensesQuery);
      const expenses = await Promise.all(
        expensesSnapshot.docs.map(async (eDoc) => {
          const eData = eDoc.data();
          const splitsQuery = query(collection(db, 'groups', groupId, 'expenses', eDoc.id, 'splits'));
          const splitsSnapshot = await getDocs(splitsQuery);
          const splits = splitsSnapshot.docs.map(sDoc => ({ id: sDoc.id, ...sDoc.data() }));
          return { id: eDoc.id, ...eData, splits };
        })
      );

      return { ...groupData, members, expenses };
    },
    enabled: !!groupId,
  });
};
