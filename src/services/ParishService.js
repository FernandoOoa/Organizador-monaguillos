import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  deleteDoc, 
  arrayUnion, 
  arrayRemove 
} from 'firebase/firestore';

export const ParishService = {
  // Crear una nueva Parroquia
  createParish: async (userId, parishName) => {
    try {
      // Generar un código de invitación aleatorio de 6 dígitos/letras
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const parishRef = doc(collection(db, 'parishes'));
      const parishId = parishRef.id;

      const parishData = {
        id: parishId,
        name: parishName,
        adminId: userId,
        inviteCode: inviteCode,
        createdAt: new Date().toISOString(),
        latestAssignments: null,
        latestAssignmentsDate: null
      };

      await setDoc(parishRef, parishData);

      // Actualizar el perfil del creador
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { parishId: parishId });

      return parishData;
    } catch (error) {
      console.error("Error al crear parroquia:", error);
      throw error;
    }
  },

  // Unirse a una Parroquia con código de invitación
  joinParish: async (userId, inviteCode) => {
    try {
      const q = query(collection(db, 'parishes'), where('inviteCode', '==', inviteCode.trim().toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("El código de invitación no es válido.");
      }

      const parishDoc = querySnapshot.docs[0];
      const parishId = parishDoc.id;

      // Actualizar el perfil del usuario
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { parishId: parishId });

      return parishDoc.data();
    } catch (error) {
      console.error("Error al unirse a la parroquia:", error);
      throw error;
    }
  },

  // Salir de una Parroquia
  leaveParish: async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { parishId: null });
    } catch (error) {
      console.error("Error al salir de la parroquia:", error);
      throw error;
    }
  },

  // Obtener detalles de la Parroquia
  getParishDetails: async (parishId) => {
    try {
      const parishRef = doc(db, 'parishes', parishId);
      const docSnap = await getDoc(parishRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error("Error al obtener detalles de la parroquia:", error);
      throw error;
    }
  },

  // Expulsar a un miembro
  kickMember: async (memberId) => {
    try {
      const userRef = doc(db, 'users', memberId);
      await updateDoc(userRef, { parishId: null });
    } catch (error) {
      console.error("Error al expulsar al miembro:", error);
      throw error;
    }
  },

  // Agregar monaguillo virtual/local
  addVirtualMonaguillo: async (parishId, name, size, skills) => {
    try {
      const virtualsRef = collection(db, 'parishes', parishId, 'virtuals');
      const docRef = await addDoc(virtualsRef, {
        name: name,
        size: size,
        skills: skills,
        isVirtual: true,
        createdAt: new Date().toISOString()
      });
      return { id: docRef.id, name, size, skills, isVirtual: true };
    } catch (error) {
      console.error("Error al añadir monaguillo virtual:", error);
      throw error;
    }
  },

  // Eliminar monaguillo virtual
  deleteVirtualMonaguillo: async (parishId, virtualId) => {
    try {
      const docRef = doc(db, 'parishes', parishId, 'virtuals', virtualId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error al eliminar monaguillo virtual:", error);
      throw error;
    }
  },

  // Obtener todos los monaguillos virtuales
  getVirtualMonaguillos: async (parishId) => {
    try {
      const virtualsRef = collection(db, 'parishes', parishId, 'virtuals');
      const querySnapshot = await getDocs(virtualsRef);
      const virtuals = [];
      querySnapshot.forEach((doc) => {
        virtuals.push({ id: doc.id, ...doc.data() });
      });
      return virtuals;
    } catch (error) {
      console.error("Error al obtener monaguillos virtuales:", error);
      throw error;
    }
  },

  // Actualizar perfil de usuario
  updateUserProfile: async (userId, data) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, data);
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      throw error;
    }
  },

  // Guardar asignaciones generadas
  saveParishAssignments: async (parishId, assignments, authorName) => {
    try {
      const parishRef = doc(db, 'parishes', parishId);
      await updateDoc(parishRef, {
        latestAssignments: assignments,
        latestAssignmentsDate: new Date().toISOString(),
        latestAssignmentsAuthor: authorName
      });
    } catch (error) {
      console.error("Error al guardar asignaciones:", error);
      throw error;
    }
  }
};
