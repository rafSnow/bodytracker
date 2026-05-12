import { db } from '../db/database';
import { Photo } from '../types/photo';
import { compressImage } from '../lib/imageUtils';

export function usePhotos() {
  const getPhotosByCheckinId = async (checkinId: number): Promise<Photo[]> => {
    return await db.photos.where('checkinId').equals(checkinId).toArray();
  };

  const getRecentPhotos = async (angle?: Photo['angle'], limit = 10): Promise<Photo[]> => {
    let query = db.photos.orderBy('id').reverse();
    
    if (angle) {
      return await db.photos
        .where('angle')
        .equals(angle)
        .reverse()
        .limit(limit)
        .toArray();
    }
    
    return await query.limit(limit).toArray();
  };

  const addPhoto = async (checkinId: number, file: File, angle: Photo['angle']): Promise<void> => {
    const compressedBlob = await compressImage(file);
    const photo: Photo = {
      checkinId,
      angle,
      blob: compressedBlob,
      takenAt: new Date().toISOString(),
    };
    await db.photos.add(photo);
  };

  const deletePhotosByCheckinId = async (checkinId: number): Promise<void> => {
    await db.photos.where('checkinId').equals(checkinId).delete();
  };

  const getAllPhotosGroupedByDate = async (): Promise<{ date: string; photos: Photo[] }[]> => {
    const allPhotos = await db.photos.toArray();
    
    // Agrupar por data (YYYY-MM-DD)
    const groups: Record<string, Photo[]> = {};
    
    allPhotos.forEach(photo => {
      const date = photo.takenAt.split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(photo);
    });
    
    return Object.entries(groups)
      .map(([date, photos]) => ({ date, photos }))
      .sort((a, b) => b.date.localeCompare(a.date));
  };

  return {
    getPhotosByCheckinId,
    getRecentPhotos,
    addPhoto,
    deletePhotosByCheckinId,
    getAllPhotosGroupedByDate,
  };
}
