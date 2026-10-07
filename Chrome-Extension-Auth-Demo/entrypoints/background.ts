import { signInWithGoogle } from '../lib/auth'


export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });
});

browser.runtime.onMessage.addListener((message) => {
  if (message.type === 'LOGIN') {
    return signInWithGoogle()
  }
})