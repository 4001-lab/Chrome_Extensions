import { supabase } from './supabaseClient'
import { browser } from 'wxt/browser'

interface Session {
  access_token: string
  refresh_token: string
}

export async function restoreSession() {
  const data = await browser.storage.local.get('session')
  const session = data.session as Session | undefined

  if (!session?.access_token || !session?.refresh_token) return null

  await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  })

  return session
}
