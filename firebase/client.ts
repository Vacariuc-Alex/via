import {initializeApp, getApp, getApps} from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDXlr7VzdTO9QhXuNu_I1l4BwV3-2xRAXM",
    authDomain: "virtual-interview-assist-914e3.firebaseapp.com",
    projectId: "virtual-interview-assist-914e3",
    storageBucket: "virtual-interview-assist-914e3.firebasestorage.app",
    messagingSenderId: "1066565692760",
    appId: "1:1066565692760:web:20d2464c8b1c8ab85cc92d",
    measurementId: "G-GBKM2J90YS"
};

const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
