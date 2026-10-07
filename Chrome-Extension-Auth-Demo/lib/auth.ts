import { supabase } from './supabaseClient'
import { browser } from 'wxt/browser'

export async function signInWithGoogle() {
  try {
    const redirectUrl = browser.identity.getRedirectURL()
    console.log('Extension redirect URL:', redirectUrl)

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    })

    if (error) throw error

    const authUrl = data.url

    const responseUrl = await browser.identity.launchWebAuthFlow({
      url: authUrl!,
      interactive: true,
    })

    if (!responseUrl) throw new Error('OAuth failed')

    const url = new URL(responseUrl)

    // Try fragment first (e.g. #access_token=...), otherwise fall back to query params (?access_token=...)
    const params =
      url.hash && url.hash.length > 1
        ? new URLSearchParams(url.hash.substring(1))
        : url.searchParams

    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')

    if (!access_token || !refresh_token) {
      throw new Error('Missing tokens')
    }

    await supabase.auth.setSession({
      access_token,
      refresh_token,
    })

    await browser.storage.local.set({ session: { access_token, refresh_token } })
  } catch (err) {
    console.error('Sign in error:', err)
    throw err
  }
}

export async function signOut() {
  await supabase.auth.signOut()
  await browser.storage.local.remove('session')
}