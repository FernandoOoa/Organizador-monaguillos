import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

// Configuración de Firebase a través de variables de entorno de Vite (.env.local)
const firebaseConfig = {
  apiKey: "AIzaSyAfPOwNBA6CYjGZsB0v0NIpqH4Z0SSZxdc",
  authDomain: "organizador-monaguillos.firebaseapp.com",
  projectId: "organizador-monaguillos",
  storageBucket: "organizador-monaguillos.firebasestorage.app",
  messagingSenderId: "551854834974",
  appId: "1:551854834974:web:e65b1d23f161febe43f50f"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
export const googleProvider = new GoogleAuthProvider();

export default app;
