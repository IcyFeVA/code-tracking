import { supabase } from '@/lib/supabase';

export const api = {
  
  getCurrentUserProfile: async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles_test')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) {
        console.error('Error fetching current user profile:', error);
        throw error;
    }
    //console.log('Current User Profile Data:', data);
    return data;
},


  updateProfile: async (userId: string, updates: any) => {
    const { data, error } = await supabase
      .from('profiles_test')
      .upsert({ id: userId, ...updates })
      .select();
    
    if (error) throw error;
    return data;
  },

  getPotentialMatches: async (userId: string, limit: number) => {
    const { data, error } = await supabase.rpc('get_potential_matches', {
      user_id: userId,
      limit_count: limit,
    });
    
    if (error) throw error;
    return data;
  },


  getProfileDetails: async (userId: string) => {
    const { data, error } = await supabase
        .from('profile_details')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) {
        console.error('Error fetching profile details:', error);
        throw error;
    }
    console.log('Profile Details Data:', data);
    return data;
},

getPotentialDiveMatches: async (userId: string, limit: number) => {
  const { data, error } = await supabase.rpc('get_potential_dive_matches', {
      user_id: userId,
      limit_count: limit,
  });
  
  if (error) {
      console.error('Error fetching potential dive matches:', error);
      throw error;
  }
  console.log('Potential Dive Matches Data:', data);
  return data;
},

  recordMatchAction: async (userId: string, matchedUserId: string, action: 'like' | 'dislike') => {
    const { data, error } = await supabase
      .rpc('handle_match_action', { 
        acting_user_id: userId, 
        target_user_id: matchedUserId,
        match_action: action === 'like' ? 1 : 0,
      });
      console.log(userId, matchedUserId, action);
      
    
    if (error) {
      console.error('Error in handle_match_action:', error);
    } else {
      console.log('Match action handled, is new match:', data);
    }
  },

  getOrCreateConversation: async (user1Id: string, user2Id: string) => {
    const { data, error } = await supabase.rpc('get_or_create_conversation', {
      user1_id: user1Id,
      user2_id: user2Id
    });
    if (error) throw error;
    return data;
  },

  getRecentConversations: async (userId: string) => {
    const { data, error } = await supabase.rpc('get_recent_conversations', {
      user_id: userId
    });
    
    if (error) throw error;
    
    return data || [];
  },

  sendMessage: async (conversationId: string, senderId: string, content: string) => {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content
      })
      .select();
    if (error) throw error;
    return data[0];
  },

  getMessages: async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  subscribeToMessages: (conversationId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, callback)
      .subscribe();
  }, 
  
  getTableInfo: async() => {
  // Fetch all tables in the public schema
  const { data: tables, error: tablesError } = await supabase
    .rpc('get_tables')

  if (tablesError) {
    console.error('Error fetching tables:', tablesError)
    return
  }

  for (const tableObj of tables) {
    const tableName = tableObj.table_name
    console.log(`Table: ${tableName}`)

    // Fetch columns for each table
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_columns', { table_name: tableName })

    if (columnsError) {
      console.error(`Error fetching columns for ${tableName}:`, columnsError)
      continue
    }

    columns.forEach(column => {
      console.log(`  - ${column.column_name}: ${column.data_type} (${column.is_nullable ? 'nullable' : 'not nullable'})`)
    })
    console.log('\n')
  }
},
  
  

};