import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts"

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Hello from process-match function!")

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function sendPushNotification(pushToken: string, title: string, body: string) {
  const message = {
    to: pushToken,
    sound: 'default',
    title: title,
    body: body,
    data: { someData: 'goes here' },
  }

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  })

  return await response.json()
}

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const { data: pendingNotifications, error } = await supabase
    .from('pending_match_notifications')
    .select('*')
    .eq('processed', false)
    .limit(50)
    
  if (error) {
    console.error('Error fetching pending notifications:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch pending notifications' }), { status: 500 })
  }

  for (const notification of pendingNotifications) {
    for (const userId of [notification.user1_id, notification.user2_id]) {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('push_token')
        .eq('id', userId)
        .single()

      if (userError || !userData?.push_token) {
        console.error(`Failed to fetch user data or push token not found for user ${userId}`)
        continue
      }

      const notificationTitle = "New Match!"
      const notificationBody = `You have a new match! Open the app to find out who.`

      try {
        await sendPushNotification(userData.push_token, notificationTitle, notificationBody)
        console.log(`Notification sent to user ${userId}`)
      } catch (error) {
        console.error(`Failed to send notification to user ${userId}:`, error)
      }
    }

    // Mark the notification as processed
    const { error: updateError } = await supabase
      .from('pending_match_notifications')
      .update({ processed: true })
      .eq('id', notification.id)

    if (updateError) {
      console.error(`Failed to mark notification ${notification.id} as processed:`, updateError)
    }
  }

  return new Response(JSON.stringify({ message: 'Notifications processed' }), { status: 200 })
})