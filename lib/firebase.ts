// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { collection, DocumentSnapshot, getDocs, getFirestore, limit, query, where } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBe6SlZ5dXQ-Eu8W4CxsAOPfoUfwp7Z7Xo",
  authDomain: "nextfire-34bff.firebaseapp.com",
  projectId: "nextfire-34bff",
  storageBucket: "nextfire-34bff.appspot.com",
  messagingSenderId: "931430308411",
  appId: "1:931430308411:web:4664813cab49cd396a1a1e",
  measurementId: "G-VL204KVY69"
};

// Initialize Firebase

if (!getApps().length) {
    initializeApp(firebaseConfig);
}

export const auth = getAuth();
export const firestore = getFirestore();
export const storage = getStorage();

// google auth provider
export const googleAuthProvider = new GoogleAuthProvider();


/**
 * Gets a users/{uid} document with username
 * @param username the name of a user
 */
export async function getUserWithUsername(username: string): Promise<DocumentSnapshot> {
  const usersRef = collection(firestore, 'users');
  const q = query(usersRef, where('username', '==', username), limit(1));
  const userDoc = (await getDocs(q)).docs[0];

  return userDoc;
}
