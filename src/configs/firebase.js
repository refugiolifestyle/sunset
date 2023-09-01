import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBtQeO2bgVwptL7Ye3wbe6OgoWs3apIwfM",
  authDomain: "refugio-89c1e.firebaseapp.com",
  databaseURL: "https://refugio-89c1e-default-rtdb.firebaseio.com",
  projectId: "refugio-89c1e",
  storageBucket: "refugio-89c1e.appspot.com",
  messagingSenderId: "948076519503",
  appId: "1:948076519503:web:7640668542a9ab60bcca3a",
  measurementId: "G-F1V1PRHK17"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseDatabase = getDatabase(firebaseApp);
export const firebaseStorage = getStorage(firebaseApp);