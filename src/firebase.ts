import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import the auth module specifically
const firebaseConfig =  {
        apiKey: "AIzaSyCz0nVLQoiklkIpMnLOJaBQE-HIu2bHUy0",
        authDomain: "collab-doc-editor-8323d.firebaseapp.com",
        projectId: "collab-doc-editor-8323d",
        storageBucket: "collab-doc-editor-8323d.firebasestorage.app",
        messagingSenderId: "232575298587",
        appId: "1:232575298587:web:ed5886ca860af47cb35cbe",
        measurementId: "G-8YT3PL4H34"
};

  
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Export the initialized Auth instance