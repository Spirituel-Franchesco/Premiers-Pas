import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCGwjbQSF5aGDe4AxEwMJjVxr2xtrwH5UI",
  authDomain: "premiers-pas-bce07.firebaseapp.com",
  projectId: "premiers-pas-bce07",
  storageBucket: "premiers-pas-bce07.firebasestorage.app",
  messagingSenderId: "492698510254",
  appId: "1:492698510254:web:a60718f617aea40d2d1e3f"
};

// Initialise Firebase
const app = initializeApp(firebaseConfig);

// Initialise Firestore
export const db = getFirestore(app);

export default app;