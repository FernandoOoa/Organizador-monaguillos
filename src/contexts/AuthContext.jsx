import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider } from '../config/firebase';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Iniciar sesión con Google
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      throw error;
    }
  };

  // Cerrar sesión
  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        // Referencia al perfil en Firestore
        const userRef = doc(db, 'users', user.uid);
        
        // Obtener el perfil del usuario
        const docSnap = await getDoc(userRef);
        
        if (!docSnap.exists()) {
          // Crear un perfil predeterminado si no existe
          const defaultProfile = {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            liturgicalName: user.displayName,
            size: 'chico',
            skills: ['Caliz', 'Copon', 'Vinajeras', 'LavaboCombo', 'Platillo'], // habilidades básicas por defecto
            parishId: null,
            joinedAt: new Date().toISOString()
          };
          await setDoc(userRef, defaultProfile);
          setUserProfile(defaultProfile);
        } else {
          setUserProfile(docSnap.data());
        }

        // Suscribirse a cambios del perfil en tiempo real
        const unsubProfile = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setUserProfile(doc.data());
          }
        });

        setLoading(false);
        return () => unsubProfile();
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loginWithGoogle,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
