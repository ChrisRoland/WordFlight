// import { initializeApp, getApps } from 'firebase/app';
// import { getFirestore }    from 'firebase/firestore';

// const firebaseConfig = {
//   apiKey: "AIzaSyC6UtguPWhM5DL81a4B1AN8ALLw6eo1uAE",
//   authDomain: "wordflight-6b378.firebaseapp.com",
//   projectId: "wordflight-6b378",
//   storageBucket: "wordflight-6b378.firebasestorage.app",
//   messagingSenderId: "31788800891",
//   appId: "1:31788800891:web:739ba699acf1be264afbde",
//   measurementId: "G-7RQBWMGEL1"
// };

// if (!getApps().length) {
//   initializeApp(firebaseConfig);
// }

// export const db = getFirestore();

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';
// connectFirestoreEmulator

const firebaseConfig = {
  apiKey: "AIzaSyC6UtguPWhM5DL81a4B1AN8ALLw6eo1uAE",
  authDomain: "wordflight-6b378.firebaseapp.com",
  projectId: "wordflight-6b378",
  storageBucket: "wordflight-6b378.firebasestorage.app",
  messagingSenderId: "31788800891",
  appId: "1:31788800891:web:739ba699acf1be264afbde",
  measurementId: "G-7RQBWMGEL1"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firestore with optimizations
export const db = getFirestore(app);

// Enable offline persistence and caching (runs only once)
if (typeof window !== 'undefined') {
  // Browser-only optimizations
  
  // Enable offline persistence for better performance and reduced reads
  import('firebase/firestore').then(({ enableIndexedDbPersistence }) => {
    enableIndexedDbPersistence(db, {
      synchronizeTabs: true // Allow multiple tabs to share the cache
    }).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support offline persistence');
      }
    });
  });

  // Optimize network usage based on connection
  const handleOnline = () => {
    enableNetwork(db);
  };

  const handleOffline = () => {
    disableNetwork(db);
  };

  // Listen for network changes
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Visibility API optimization - reduce activity when tab is hidden
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Optionally disable network when tab is hidden
      // disableNetwork(db);
    } else {
      enableNetwork(db);
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
}

// Utility function to check connection status
export const isOnline = () => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

// Export optimized settings for queries
export const FIREBASE_SETTINGS = {
  // Pagination limits to reduce reads
  MESSAGES_LIMIT: 25,
  LOAD_MORE_LIMIT: 20,
  ROOMS_LIMIT: 50,
  
  // Cache settings
  CACHE_SIZE_BYTES: 40 * 1024 * 1024, // 40MB cache
  
  // Real-time listener settings
  LISTENER_TIMEOUT: 30000, // 30 seconds timeout
};

// Helper function for batch operations
export const createBatch = async () => {
  const { writeBatch } = await import('firebase/firestore');
  return writeBatch(db);
};

// Optimized query helpers
export const createOptimizedQuery = async (collectionRef, ...queryConstraints) => {
  const { query } = await import('firebase/firestore');
  return query(collectionRef, ...queryConstraints);
};

// Error handling utility
export const handleFirebaseError = (error, operation = 'Firebase operation') => {
  console.error(`${operation} failed:`, error);
  
  // Handle specific error codes
  switch (error.code) {
    case 'unavailable':
      console.warn('Firestore temporarily unavailable. Operating in offline mode.');
      break;
    case 'permission-denied':
      console.error('Permission denied. Check Firestore security rules.');
      break;
    case 'quota-exceeded':
      console.error('Quota exceeded. Consider optimizing queries or upgrading plan.');
      break;
    default:
      console.error('Unexpected error:', error.message);
  }
  
  return error;
};