import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { PMEntry } from '../types';
import { handleFirestoreError, OperationType } from '../firebase';

export const createPMEntry = async (entry: Omit<PMEntry, 'id' | 'timestamp' | 'userId' | 'userEmail' | 'status' | 'assignedTo'>) => {
  if (!auth.currentUser) throw new Error('User not authenticated');

  const fullEntry: Omit<PMEntry, 'id'> = {
    ...entry,
    timestamp: serverTimestamp(),
    userId: auth.currentUser.uid,
    userEmail: auth.currentUser.email || '',
    status: 'Open',
    assignedTo: 'PM Crew for Sunday'
  };

  try {
    const docRef = await addDoc(collection(db, 'pmlist'), fullEntry);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'pmlist');
  }
};

export const subscribeToPMEntries = (callback: (entries: PMEntry[]) => void) => {
  const q = query(collection(db, 'pmlist'), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PMEntry[];
    callback(entries);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'pmlist');
  });
};
