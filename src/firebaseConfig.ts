import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Import the functions you need from the SDKs you need

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlnhMOwkpFqPAk6o2nPNwSAX0Kghqn6zY",
  authDomain: "my-student-app-3eee4.firebaseapp.com",
  projectId: "my-student-app-3eee4",
  storageBucket: "my-student-app-3eee4.firebasestorage.app",
  messagingSenderId: "702184238601",
  appId: "1:702184238601:web:6503feee6ffb73b9d712d8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const db = getFirestore(app);
export const auth = getAuth(app);



// Initialize Firebase
