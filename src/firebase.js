// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyACqFA3-yKnnBN9r84oGj0mQJTjqVcUTIo",
  authDomain: "govaly-spredsheet.firebaseapp.com",
  projectId: "govaly-spredsheet",
  storageBucket: "govaly-spredsheet.firebasestorage.app",
  messagingSenderId: "149347758045",
  appId: "1:149347758045:web:911a3ba64049a7e52cd034",
  measurementId: "G-R2GD74SBPY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };
