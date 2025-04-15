// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBn29V1J7ggfEDqO2WP0vtzj2_6f4ojNPg",
    authDomain: "pet-shop-d2825.firebaseapp.com",
    databaseURL: "https://pet-shop-d2825-default-rtdb.firebaseio.com",
    projectId: "pet-shop-d2825",
    storageBucket: "pet-shop-d2825.firebasestorage.app",
    messagingSenderId: "470130183122",
    appId: "1:470130183122:web:2e1c61fe991d736c84560b"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
