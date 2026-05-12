import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { User, AppMode } from '../types';

const USERS_COLLECTION = 'users';

export async function getUsers(): Promise<User[]> {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, USERS_COLLECTION);
    return [];
  }
}

export async function createUser(userData: Omit<User, 'id'>): Promise<string> {
  try {
    // We use email as ID for easier lookup if needed, or just auto-id
    const userRef = doc(collection(db, USERS_COLLECTION));
    const newUser = {
      ...userData,
      firstLogin: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(userRef, newUser);
    return userRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, USERS_COLLECTION);
    throw error;
  }
}

export async function updateUser(userId: string, data: Partial<User>): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${USERS_COLLECTION}/${userId}`);
    throw error;
  }
}

export async function deleteUser(userId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, USERS_COLLECTION, userId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${USERS_COLLECTION}/${userId}`);
      throw error;
    }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const q = query(collection(db, USERS_COLLECTION), where("email", "==", email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return null;
    
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data() as User;
    
    if (userData.password === password) {
      return { id: userDoc.id, ...userData };
    }
    
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, USERS_COLLECTION);
    return null;
  }
}
