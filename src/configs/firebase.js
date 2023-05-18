import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAE5SW_veCqMOdXxFOO1VNeLap8Arkf6rg",
  authDomain: "refugio-sunset.firebaseapp.com",
  databaseURL: "https://refugio-sunset-default-rtdb.firebaseio.com",
  projectId: "refugio-sunset",
  storageBucket: "refugio-sunset.appspot.com",
  messagingSenderId: "538226140210",
  appId: "1:538226140210:web:7ed6d6579fffb755b8c82b"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseDatabase = getDatabase(firebaseApp);
export const firebaseStorage = getStorage(firebaseApp);