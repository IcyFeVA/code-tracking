import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string

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

  const data = await response.json()
  console.log(data)
  return data
}

serve(async (req) => {
  const { user_id, matched_user_id } = await req.json()

  // Fetch the push token for the user to be notified
  const { data: userData, error: userError } = await supabase
    .from('profiles_test')
    .select('push_token, name')
    .eq('id', user_id)
    .single()

  if (userError || !userData?.push_token) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch user data or push token not found' }),
      { status: 400 }
    )
  }

  // Fetch the name of the user who created the match
  const { data: matchedUserData, error: matchedUserError } = await supabase
    .from('profiles_test')
    .select('name')
    .eq('id', matched_user_id)
    .single()

  if (matchedUserError) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch matched user data' }),
      { status: 400 }
    )
  }

  const notificationTitle = "New Match!"
  const notificationBody = `You have a new match! Open the app to find out who.`

  const result = await sendPushNotification(userData.push_token, notificationTitle, notificationBody)

  return new Response(
    JSON.stringify({ result }),
    { headers: { "Content-Type": "application/json" } },
  )
})