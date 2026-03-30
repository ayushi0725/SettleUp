import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useStore } from '../store/useStore';

export const useGroups = () => {
  const { user } = useStore();

  return useQuery({
    queryKey: ['groups', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      
      // 1. Get group IDs from group_members collection
      const membersQuery = query(
        collection(db, 'group_members'),
        where('user_id', '==', user.uid)
      );
      const membersSnapshot = await getDocs(membersQuery);
      const groupIds = membersSnapshot.docs.map(doc => doc.data().group_id);

      if (groupIds.length === 0) return [];

      // 2. Fetch group details for each group ID
      const groups = await Promise.all(
        groupIds.map(async (id) => {
          const groupDoc = await getDoc(doc(db, 'groups', id));
          return { id: groupDoc.id, ...groupDoc.data() };
        })
      );

      return groups;
    },
    enabled: !!user,
  });
};
