import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useStore } from '../../store/useStore';
import { Users, LogIn, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const JoinGroup: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user, isAuthLoading } = useStore();
  const [group, setGroup] = useState<any>(null);
  const [isLoading, setLoading] = useState(true);
  const [isJoining, setJoining] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId) return;
      try {
        const groupDoc = await getDoc(doc(db, 'groups', groupId));
        if (groupDoc.exists()) {
          setGroup({ id: groupDoc.id, ...groupDoc.data() });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [groupId]);

  const handleJoin = async () => {
    if (!user || !groupId) return;
    setJoining(true);
    try {
      // Check if already a member
      const memberId = `${groupId}_${user.uid}`;
      const memberDoc = await getDoc(doc(db, 'group_members', memberId));
      if (memberDoc.exists()) {
        toast.info('You are already a member of this group.');
        navigate(`/groups/${groupId}`);
        return;
      }

      // Add as member
      await setDoc(doc(db, 'group_members', memberId), {
        group_id: groupId,
        user_id: user.uid,
        role: 'member',
        joined_at: serverTimestamp(),
      });

      toast.success(`Joined ${group.name}!`);
      navigate(`/groups/${groupId}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to join group.');
    } finally {
      setJoining(false);
    }
  };

  if (isLoading || isAuthLoading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Group not found</h2>
        <p className="text-neutral-500 mb-6">The invite link might be invalid or expired.</p>
        <Link to="/" className="bg-neutral-900 text-white px-6 py-2 rounded-xl">Go to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 border border-neutral-200 text-center">
        <div className="w-20 h-20 bg-neutral-100 rounded-3xl flex items-center justify-center text-neutral-500 mx-auto mb-6">
          {group.avatar_url ? (
            <img src={group.avatar_url} alt={group.name} className="w-full h-full rounded-3xl object-cover" />
          ) : (
            <Users className="w-10 h-10" />
          )}
        </div>
        
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Join Group</h1>
        <p className="text-neutral-500 mb-8">You've been invited to join <span className="font-bold text-neutral-900">{group.name}</span>.</p>

        {user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100 mb-6">
              <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-10 h-10 rounded-full" />
              <div className="text-left">
                <div className="text-sm font-bold text-neutral-900">{user.displayName}</div>
                <div className="text-xs text-neutral-400">{user.email}</div>
              </div>
            </div>
            <button
              onClick={handleJoin}
              disabled={isJoining}
              className="w-full bg-neutral-900 text-white font-bold py-4 px-6 rounded-2xl hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-200 flex items-center justify-center gap-2"
            >
              {isJoining ? 'Joining...' : 'Accept Invitation'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-neutral-400 italic">Please log in to accept the invitation.</p>
            <Link
              to="/login"
              className="w-full bg-neutral-900 text-white font-bold py-4 px-6 rounded-2xl hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-200 flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Log in to Join
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
