import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts"
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts"

const STREAM_API_KEY = Deno.env.get('STREAM_API_KEY')
const STREAM_API_SECRET = Deno.env.get('STREAM_API_SECRET')

if (!STREAM_API_KEY || !STREAM_API_SECRET) {
  throw new Error('STREAM_API_KEY or STREAM_API_SECRET is not set')
}

async function JWTUserToken(
  apiSecret: string,
  payload: { user_id: string; exp?: number; iat?: number; }
) {
  const encoder = new TextEncoder();
  const keyBuf = encoder.encode(apiSecret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyBuf,
    { name: "HMAC", hash: "SHA-256" },
    true,
    ["sign", "verify"]
  );

  const header = { alg: "HS256", typ: "JWT" };

  if (!payload.iat) {
    payload.iat = getNumericDate(new Date());
  }

  if (!payload.exp) {
    payload.exp = getNumericDate(new Date(Date.now() + 60 * 60 * 1000)); // 1 hour from now
  }

  return await create(header, payload, key);
}

serve(async (req) => {
  try {
    console.log("Request received");
    const { user } = await req.json()
    console.log("User data:", user);

    if (!user || !user.id) {
      console.log("User ID is missing");
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const payload = {
      user_id: user.id,
    };

    console.log("Generating token for user:", user.id);
    const token = await JWTUserToken(STREAM_API_SECRET, payload);
    console.log("Token generated successfully");

    return new Response(
      JSON.stringify({ token }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in generate-stream-token:', error)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})










