import { useState, useEffect } from "react";
import {
  BirthEntry,
  subscribeToBirths,
  addBirth,
  updateBirth,
  deleteBirth,
  Gender,
  DeliveryMethod,
} from "../lib/births";
import { useAuth } from "./useAuth";

interface UseBirthsReturn {
  births: BirthEntry[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  add: (data: {
    date: Date;
    gender: Gender | null;
    deliveryMethod: DeliveryMethod | null;
    notes: string | null;
    isHistorical: boolean;
  }) => Promise<void>;
  update: (
    birthId: string,
    data: { 
      date?: Date; 
      gender?: Gender | null; 
      deliveryMethod?: DeliveryMethod | null;
      notes?: string | null;
    }
  ) => Promise<void>;
  remove: (birthId: string) => Promise<void>;
}

export function useBirths(): UseBirthsReturn {
  const { user } = useAuth();
  const [births, setBirths] = useState<BirthEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setBirths([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToBirths(
      user.uid,
      (entries) => {
        setBirths(entries);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching births:", err);
        setError("Failed to load birth records");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const add = async (data: {
    date: Date;
    gender: Gender | null;
    deliveryMethod: DeliveryMethod | null;
    notes: string | null;
    isHistorical: boolean;
  }) => {
    if (!user) throw new Error("Not authenticated");
    await addBirth(user.uid, data);
  };

  const update = async (
    birthId: string,
    data: { 
      date?: Date; 
      gender?: Gender | null; 
      deliveryMethod?: DeliveryMethod | null;
      notes?: string | null;
    }
  ) => {
    if (!user) throw new Error("Not authenticated");
    await updateBirth(user.uid, birthId, data);
  };

  const remove = async (birthId: string) => {
    if (!user) throw new Error("Not authenticated");
    await deleteBirth(user.uid, birthId);
  };

  return {
    births,
    loading,
    error,
    totalCount: births.length,
    add,
    update,
    remove,
  };
}