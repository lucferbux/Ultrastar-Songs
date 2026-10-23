import { initializeApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

const env = import.meta.env
const useEmulators = env.VITE_USE_EMULATORS === 'true'

export const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY || 'demo-key',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: useEmulators ? 'demo-ultrastar' : env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
})

// App Check proves requests come from this app. Enabled once a reCAPTCHA Enterprise site key
// is configured (see README); enforce it in the console only after it reports valid traffic.
if (env.VITE_APPCHECK_SITE_KEY && !useEmulators) {
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(env.VITE_APPCHECK_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
  })
}

export const auth = getAuth(app)

// Offline cache: the catalog is downloaded once and served locally afterwards.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})

if (useEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}
