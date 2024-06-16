import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAHzoxUGSYMFTl1HIRtocBe7bStGsSyNVc",
    authDomain: "whiteboard-harsh.firebaseapp.com",
    projectId: "whiteboard-harsh",
    storageBucket: "whiteboard-harsh.appspot.com",
    messagingSenderId: "1011591292914",
    appId: "1:1011591292914:web:6c9cf994c3546aecbc6d6b",
    measurementId: "G-6E1H0V182V"
};
  
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
