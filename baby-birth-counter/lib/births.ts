import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export type Gender = "male" | "female";
export type DeliveryMethod = "csection" | "vaginal";

export interface BirthEntry {
  id: string;
  date: Date;
  gender: Gender | null;
  deliveryMethod: DeliveryMethod | null;
  notes: string | null;
  isHistorical: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Firestore document shape (before conversion)
interface BirthDoc {
  date: Timestamp;
  gender: Gender | null;
  deliveryMethod?: DeliveryMethod | null; // Optional for backward compatibility
  notes: string | null;
  isHistorical: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Get the births subcollection reference for a user.
 */
function birthsRef(userId: string) {
  return collection(db, "users", userId, "births");
}

/**
 * Subscribe to real-time birth entries for a user.
 * Returns an unsubscribe function.
 */
export function subscribeToBirths(
  userId: string,
  onData: (entries: BirthEntry[]) => void,
  onError: (error: Error) => void
) {
  const q = query(birthsRef(userId), orderBy("date", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const entries: BirthEntry[] = snapshot.docs.map((doc) => {
        const data = doc.data() as BirthDoc;
        return {
          id: doc.id,
          date: data.date.toDate(),
          gender: data.gender,
          deliveryMethod: data.deliveryMethod || null,
          notes: data.notes,
          isHistorical: data.isHistorical,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      });
      onData(entries);
    },
    onError
  );
}

/**
 * Add a new birth entry.
 */
export async function addBirth(
  userId: string,
  data: {
    date: Date;
    gender: Gender | null;
    deliveryMethod: DeliveryMethod | null;
    notes: string | null;
    isHistorical: boolean;
  }
): Promise<string> {
  const docRef = await addDoc(birthsRef(userId), {
    date: Timestamp.fromDate(data.date),
    gender: data.gender,
    deliveryMethod: data.deliveryMethod || null,
    notes: data.notes || null,
    isHistorical: data.isHistorical,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Update an existing birth entry.
 */
export async function updateBirth(
  userId: string,
  birthId: string,
  data: {
    date?: Date;
    gender?: Gender | null;
    deliveryMethod?: DeliveryMethod | null;
    notes?: string | null;
  }
): Promise<void> {
  const birthDoc = doc(db, "users", userId, "births", birthId);

  const updateData: Record<string, any> = {
    updatedAt: serverTimestamp(),
  };

  if (data.date !== undefined) {
    updateData.date = Timestamp.fromDate(data.date);
  }
  if (data.gender !== undefined) {
    updateData.gender = data.gender;
  }
  if (data.deliveryMethod !== undefined) {
    updateData.deliveryMethod = data.deliveryMethod || null;
  }
  if (data.notes !== undefined) {
    updateData.notes = data.notes || null;
  }

  await updateDoc(birthDoc, updateData);
}

/**
 * Delete a birth entry.
 */
export async function deleteBirth(
  userId: string,
  birthId: string
): Promise<void> {
  const birthDoc = doc(db, "users", userId, "births", birthId);
  await deleteDoc(birthDoc);
}