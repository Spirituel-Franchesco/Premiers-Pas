import { db } from "../../firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

// Récupérer les données transport d'une ville
export const getTransportData = async (city) => {
  try {
    const docRef = doc(db, "cities", city, "transport", "info");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Erreur Firestore:", error);
    return null;
  }
};

// Récupérer les services d'une ville
export const getServicesData = async (city) => {
  try {
    const docRef = doc(db, "cities", city, "services", "info");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Erreur Firestore:", error);
    return null;
  }
};

// Récupérer le contenu universel
export const getUniversalContent = async (contentType) => {
  try {
    const docRef = doc(db, "universal_content", contentType);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Erreur Firestore:", error);
    return null;
  }
};

export const getHealthData = async (city) => {
  try {
    const docRef = doc(db, "cities", city, "health", "info");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Erreur Firestore santé:", error);
    return null;
  }
};

export const getVocabularyData = async () => {
  try {
    const querySnapshot = await getDocs(
      collection(db, "vocabulary", "expressions", "items"),
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Erreur vocabulary:", error);
    return [];
  }
};
