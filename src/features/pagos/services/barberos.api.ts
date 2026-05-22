import { db } from "../../../../services/firebaseConfig";
import {
  collection, getDocs, addDoc, deleteDoc,
  doc, query, orderBy,
} from "firebase/firestore";

export type Barbero = {
  id: string;
  name: string;
  commissionPercentage: number;
  isActive: boolean;
};

export async function listBarberos(): Promise<Barbero[]> {
  const q = query(collection(db, "barberos"), orderBy("name", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name || "",
      commissionPercentage: data.commissionPercentage ?? 50,
      isActive: data.isActive ?? true,
    };
  });
}

export async function createBarbero(nombre: string): Promise<Barbero> {
  const ref = await addDoc(collection(db, "barberos"), { name: nombre, commissionPercentage: 50, isActive: true });
  return { id: ref.id, name: nombre, commissionPercentage: 50, isActive: true };
}

export async function deleteBarbero(id: string): Promise<void> {
  await deleteDoc(doc(db, "barberos", id));
}
