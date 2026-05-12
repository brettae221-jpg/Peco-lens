import { useState, useEffect, useCallback } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, onSnapshot, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';

export function usePWAUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [checking, setChecking] = useState(false);
  const [lastRemoteUpdate, setLastRemoteUpdate] = useState<any>(null);

  // Listen for local Service Worker updates
  useEffect(() => {
    const handleUpdate = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener('pwa-update-available', handleUpdate);
    
    // Initial check
    if ((window as any).swRegistration?.waiting) {
        setUpdateAvailable(true);
    }

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdate);
    };
  }, []);

  // Listen for remote signal to check for updates
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'system', 'config'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLastRemoteUpdate(data.lastUpdateAt);
        
        // If a remote update was issued, trigger a service worker check
        if (data.forceCheck) {
           checkForUpdates();
        }
      }
    }, (error) => {
      console.warn("Could not listen to system config:", error);
    });

    return () => unsubscribe();
  }, []);

  const checkForUpdates = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;
    
    setChecking(true);
    try {
      const registration = (window as any).swRegistration || await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        // If there's already a waiting worker, set available
        if (registration.waiting) {
            setUpdateAvailable(true);
        }
      }
    } catch (error) {
      console.error('Update check failed:', error);
    } finally {
      setChecking(false);
    }
  }, []);

  const issueRemoteUpdate = useCallback(async () => {
    try {
      const configRef = doc(db, 'system', 'config');
      await setDoc(configRef, {
        lastUpdateAt: serverTimestamp(),
        forceCheck: true,
        issuedBy: 'admin'
      }, { merge: true });
      
      // Reset forceCheck after a short delay
      setTimeout(async () => {
         await setDoc(configRef, { forceCheck: false }, { merge: true });
      }, 5000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'system/config');
    }
  }, []);

  const applyUpdate = useCallback(() => {
    const registration = (window as any).swRegistration;
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  }, []);

  return { updateAvailable, checkForUpdates, applyUpdate, checking, lastRemoteUpdate, issueRemoteUpdate };
}
