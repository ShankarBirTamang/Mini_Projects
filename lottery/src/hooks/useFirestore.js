import { useState, useEffect } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export const useFirestore = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener for channels
  useEffect(() => {
    const q = query(collection(db, "channels"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const channelsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChannels(channelsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Create a new channel
  const createChannel = async (channelData) => {
    try {
      const docRef = await addDoc(collection(db, "channels"), {
        ...channelData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating channel:", error);
      throw error;
    }
  };

  // Update a channel
  const updateChannel = async (channelId, updates) => {
    try {
      const channelRef = doc(db, "channels", channelId);
      await updateDoc(channelRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating channel:", error);
      throw error;
    }
  };

  // Delete a channel
  const deleteChannel = async (channelId) => {
    try {
      await deleteDoc(doc(db, "channels", channelId));
    } catch (error) {
      console.error("Error deleting channel:", error);
      throw error;
    }
  };

  // Real-time listener for a specific channel
  const useChannelListener = (channelId) => {
    const [channel, setChannel] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!channelId) {
        setChannel(null);
        setLoading(false);
        return;
      }

      const channelRef = doc(db, "channels", channelId);
      const unsubscribe = onSnapshot(channelRef, (doc) => {
        if (doc.exists()) {
          setChannel({ id: doc.id, ...doc.data() });
        } else {
          setChannel(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }, [channelId]);

    return { channel, loading };
  };

  return {
    channels,
    loading,
    createChannel,
    updateChannel,
    deleteChannel,
    useChannelListener,
  };
};
