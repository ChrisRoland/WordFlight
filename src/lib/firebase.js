import { initializeApp, getApps } from 'firebase/app';
import { getFirestore }    from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC6UtguPWhM5DL81a4B1AN8ALLw6eo1uAE",
  authDomain: "wordflight-6b378.firebaseapp.com",
  projectId: "wordflight-6b378",
  storageBucket: "wordflight-6b378.firebasestorage.app",
  messagingSenderId: "31788800891",
  appId: "1:31788800891:web:739ba699acf1be264afbde",
  measurementId: "G-7RQBWMGEL1"
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export const db = getFirestore();

// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyC6UtguPWhM5DL81a4B1AN8ALLw6eo1uAE",
//   authDomain: "wordflight-6b378.firebaseapp.com",
//   projectId: "wordflight-6b378",
//   storageBucket: "wordflight-6b378.firebasestorage.app",
//   messagingSenderId: "31788800891",
//   appId: "1:31788800891:web:739ba699acf1be264afbde",
//   measurementId: "G-7RQBWMGEL1"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);