import { db } from "../../../../services/firebaseConfig";
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  where 
} from "firebase/firestore";

export interface Barbero {
  id: string;
  name: string;
  commissionPercentage: number;
  isActive: boolean;
}

export interface ServicioBarberia {
  id: string;
  name: string;
  price: number;
}

const BARBERS_COLLECTION = "barberos";
const SERVICES_COLLECTION = "services";

export const ajustesService = {
  // 💈 GESTIÓN DE BARBEROS
  async getBarberos(): Promise<Barbero[]> {
    const q = query(collection(db, BARBERS_COLLECTION));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Barbero[];
  },

  async agregarBarbero(barbero: Omit<Barbero, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, BARBERS_COLLECTION), barbero);
    return docRef.id;
  },

  async actualizarBarbero(id: string, data: Partial<Barbero>): Promise<void> {
    const docRef = doc(db, BARBERS_COLLECTION, id);
    await updateDoc(docRef, data);
  },

  // ✂️ GESTIÓN DE SERVICIOS
  async getServicios(): Promise<ServicioBarberia[]> {
    const querySnapshot = await getDocs(collection(db, SERVICES_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ServicioBarberia[];
  },

  async agregarServicio(servicio: Omit<ServicioBarberia, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, SERVICES_COLLECTION), servicio);
    return docRef.id;
  },

  async actualizarServicio(id: string, data: Partial<ServicioBarberia>): Promise<void> {
    const docRef = doc(db, SERVICES_COLLECTION, id);
    await updateDoc(docRef, data);
  },

  async eliminarServicio(id: string): Promise<void> {
    const docRef = doc(db, SERVICES_COLLECTION, id);
    await updateDoc(docRef, { deleted: true, deletedAt: new Date().toISOString() });
  },

  async eliminarBarbero(id: string): Promise<void> {
    const docRef = doc(db, BARBERS_COLLECTION, id);
    await updateDoc(docRef, { deleted: true, deletedAt: new Date().toISOString() });
  }
};