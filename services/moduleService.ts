import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ModuleConfig, AppMode } from '../types';

const MODULES_COLLECTION = 'system_modules';

export function subscribeToModules(onUpdate: (modules: ModuleConfig[]) => void) {
  const q = query(collection(db, MODULES_COLLECTION), orderBy('order', 'asc'));
  
  const defaults: ModuleConfig[] = [
    { id: AppMode.Dashboard, label: 'Home', icon: 'Home', order: 0, visible: true },
    { id: AppMode.Lenses, label: 'Lenses', icon: 'Camera', order: 1, visible: true },
    { id: AppMode.Maintenance, label: 'Logs', icon: 'ClipboardList', order: 2, visible: true },
    { id: AppMode.Tools, label: 'Tools', icon: 'Wrench', order: 3, visible: true },
    { id: AppMode.AIChat, label: 'Neural AI', icon: 'Zap', order: 4, visible: true },
    { id: AppMode.Training, label: 'Academy', icon: 'BookOpen', order: 5, visible: true },
    { id: AppMode.Gallery, label: 'Archive', icon: 'Image', order: 6, visible: true },
    { id: AppMode.Messages, label: 'Comms', icon: 'MessageSquare', order: 7, visible: true },
    { id: AppMode.NewsFeed, label: 'Pulse', icon: 'Newspaper', order: 8, visible: true },
    { id: AppMode.Settings, label: 'Config', icon: 'Settings', order: 9, visible: true },
  ];

  return onSnapshot(q, (snapshot) => {
    const dbMods = snapshot.docs.map(doc => doc.data() as ModuleConfig);
    
    // Fallback defaults if DB is empty
    if (snapshot.empty) {
      onUpdate(defaults);
      return;
    }

    onUpdate(dbMods);
  }, (error) => {
    console.warn("Module Sync Warning (using local defaults):", error);
    onUpdate(defaults);
  });
}

export async function getModules(): Promise<ModuleConfig[]> {
  const defaults: ModuleConfig[] = [
    { id: AppMode.Dashboard, label: 'Home', icon: 'Home', order: 0, visible: true },
    { id: AppMode.Lenses, label: 'Lenses', icon: 'Camera', order: 1, visible: true },
    { id: AppMode.Maintenance, label: 'Logs', icon: 'ClipboardList', order: 2, visible: true },
    { id: AppMode.Tools, label: 'Tools', icon: 'Wrench', order: 3, visible: true },
    { id: AppMode.AIChat, label: 'Neural AI', icon: 'Zap', order: 4, visible: true },
    { id: AppMode.Training, label: 'Academy', icon: 'BookOpen', order: 5, visible: true },
    { id: AppMode.Gallery, label: 'Archive', icon: 'Image', order: 6, visible: true },
    { id: AppMode.Messages, label: 'Comms', icon: 'MessageSquare', order: 7, visible: true },
    { id: AppMode.NewsFeed, label: 'Pulse', icon: 'Newspaper', order: 8, visible: true },
    { id: AppMode.Settings, label: 'Config', icon: 'Settings', order: 9, visible: true },
  ];

  try {
    const querySnapshot = await getDocs(query(collection(db, MODULES_COLLECTION), orderBy('order', 'asc')));
    
    if (querySnapshot.empty) {
        return defaults;
    }

    return querySnapshot.docs.map(doc => doc.data() as ModuleConfig);
  } catch (error) {
    console.error("Failed to fetch modules, using fallback:", error);
    return defaults;
  }
}

export async function updateModule(moduleId: string, data: Partial<ModuleConfig>): Promise<void> {
  try {
    await setDoc(doc(db, MODULES_COLLECTION, moduleId), data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${MODULES_COLLECTION}/${moduleId}`);
    throw error;
  }
}

export async function saveModules(modules: ModuleConfig[]): Promise<void> {
    try {
        for (const mod of modules) {
            await setDoc(doc(db, MODULES_COLLECTION, mod.id), mod);
        }
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, MODULES_COLLECTION);
        throw error;
    }
}
