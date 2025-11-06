import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyALw-tgG2iAtCnRDwrubq98gKBNYzE4vKg',
  authDomain: 'gas-management-6e1c0.firebaseapp.com',
  projectId: 'gas-management-6e1c0',
  storageBucket: 'gas-management-6e1c0.firebasestorage.app',
  messagingSenderId: '536911578489',
  appId: '1:536911578489:web:fa90cadd66d6d4eea35ba8',
  measurementId: 'G-4KN25J3WZ8',
};

// Ensure single initialization across HMR/SSR
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Firestore (client-side)
export const db = getFirestore(firebaseApp);

// Analytics is browser-only and optional
let analyticsInstance: Analytics | undefined;

if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analyticsInstance = getAnalytics(firebaseApp);
      }
    })
    .catch(() => {
      // ignore analytics init errors
    });
}

export const analytics = analyticsInstance;
