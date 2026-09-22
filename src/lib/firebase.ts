import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, initializeFirestore, setLogLevel, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence benign internal gRPC idle listen stream cancellation logs
try {
  setLogLevel('error');
} catch {
  // Ignore if setLogLevel is unsupported in environment
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Lazily initialize Firestore with long-polling to prevent open idle streaming connections
let _db: Firestore | null = null;
export function getDb(): Firestore {
  if (!_db) {
    try {
      _db = initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
      }, firebaseConfig.firestoreDatabaseId || undefined);
    } catch {
      _db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
    }
  }
  return _db;
}

export const db: Firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    const inst = getDb() as any;
    const value = inst[prop];
    return typeof value === 'function' ? value.bind(inst) : value;
  },
});

export { signInWithPopup, signOut };
export default app;
