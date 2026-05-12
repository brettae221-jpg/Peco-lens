import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy,
  updateDoc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ModuleConfig, AppMode } from '../types';

const MODULES_COLLECTION = 'system_modules';

export async function getModules(): Promise<ModuleConfig[]> {
  try {
    const querySnapshot = await getDocs(query(collection(db, MODULES_COLLECTION), orderBy('order', 'asc')));
    const defaults: ModuleConfig[] = [
        { id: AppMode.Dashboard, label: 'Home', icon: 'Home', order: 0, visible: true },
        { id: AppMode.Lenses, label: 'Lenses', icon: 'Camera', order: 1, visible: true },
        { id: AppMode.Tools, label: 'Tools', icon: 'Wrench', order: 2, visible: true },
        { id: AppMode.AIChat, label: 'Neural AI', icon: 'Zap', order: 3, visible: true },
        { id: AppMode.Messages, label: 'Messages', icon: 'MessageSquare', order: 4, visible: true },
        { id: AppMode.Settings, label: 'Settings', icon: 'Settings', order: 5, visible: true },
    ];

    if (querySnapshot.empty) {
        return defaults;
    }

    const dbMods = querySnapshot.docs.map(doc => doc.data() as ModuleConfig);
    
    // Ensure AIChat exists and filter out deprecated ones (like shift-report, export)
    const validModes = Object.values(AppMode) as string[];
    const filteredDbMods = dbMods.filter(m => validModes.includes(m.id));
    
    if (!filteredDbMods.find(m => m.id === AppMode.AIChat)) {
        filteredDbMods.splice(3, 0, defaults[3]); // Insert AIChat
    }

    return filteredDbMods;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, MODULES_COLLECTION);
    return [];
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
