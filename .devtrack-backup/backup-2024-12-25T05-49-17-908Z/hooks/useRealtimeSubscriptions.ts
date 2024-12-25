// hooks/useRealtimeSubscriptions.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export const useRealtimeSubscriptions = () => {
  const session = useAuth();
  const [newMatches, setNewMatches] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!session?.user?.id) return;

    const matchesSubscription = supabase
      .channel('matches')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'matches',
        filter: `user2_id=eq.${session.user.id}`,
      }, (payload) => {
        setNewMatches((prev) => prev + 1);
      })
      .subscribe();

    const messagesSubscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, async (payload) => {
        const { data, error } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', payload.new.conversation_id)
          .eq('user_id', session.user.id)
          .single();

        if (data && payload.new.sender_id !== session.user.id) {
          setUnreadMessages((prev) => prev + 1);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(matchesSubscription);
      supabase.removeChannel(messagesSubscription);
    };
  }, [session?.user?.id]);

  return { newMatches, unreadMessages };
};