
import { useState, useCallback, useEffect } from 'react';

interface OfflinePhoto {
  id: string;
  blob: Blob;
  fileName: string;
  timestamp: number;
  wantAudio: boolean;
}

export const useOfflineStorage = () => {
  const [pendingUploads, setPendingUploads] = useState<OfflinePhoto[]>([]);

  // Load pending uploads on mount
  useEffect(() => {
    const loadPendingUploads = async () => {
      try {
        const stored = localStorage.getItem('offlinePhotos');
        if (stored) {
          const photos = JSON.parse(stored);
          // Convert base64 back to blobs for display
          const photosWithBlobs = await Promise.all(
            photos.map(async (photo: any) => {
              const response = await fetch(photo.blob);
              const blob = await response.blob();
              return { ...photo, blob };
            })
          );
          setPendingUploads(photosWithBlobs);
        }
      } catch (error) {
        console.error('Failed to load pending uploads:', error);
      }
    };
    
    loadPendingUploads();
  }, []);

  const saveOffline = useCallback(async (blob: Blob, fileName: string, wantAudio: boolean) => {
    const photo: OfflinePhoto = {
      id: crypto.randomUUID(),
      blob,
      fileName,
      timestamp: Date.now(),
      wantAudio
    };

    try {
      const stored = localStorage.getItem('offlinePhotos');
      const photos = stored ? JSON.parse(stored) : [];
      
      // Convert blob to base64 for storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        photos.push({
          ...photo,
          blob: base64
        });
        localStorage.setItem('offlinePhotos', JSON.stringify(photos));
        setPendingUploads(prev => [...prev, photo]);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Failed to save offline:', error);
      throw error;
    }
  }, []);

  const syncPending = useCallback(async (webhookUrl: string) => {
    const stored = localStorage.getItem('offlinePhotos');
    if (!stored) return;

    const photos = JSON.parse(stored);
    const successful: string[] = [];

    for (const photo of photos) {
      try {
        // Convert base64 back to blob
        const response = await fetch(photo.blob);
        const blob = await response.blob();
        
        const formData = new FormData();
        formData.append('file', blob, photo.fileName);
        formData.append('filename', photo.fileName);
        formData.append('wantAudio', photo.wantAudio.toString());

        const uploadResponse = await fetch(webhookUrl, {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          successful.push(photo.id);
          console.log('Successfully synced offline photo:', photo.fileName);
        }
      } catch (error) {
        console.error('Sync failed for photo:', photo.id, error);
      }
    }

    // Remove successful uploads
    if (successful.length > 0) {
      const remaining = photos.filter((p: any) => !successful.includes(p.id));
      localStorage.setItem('offlinePhotos', JSON.stringify(remaining));
      setPendingUploads(prev => prev.filter(p => !successful.includes(p.id)));
    }

    return successful.length;
  }, []);

  return {
    saveOffline,
    syncPending,
    pendingUploads
  };
};
