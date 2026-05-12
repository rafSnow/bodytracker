export interface Photo {
  id?: number;
  checkinId: number;
  angle: 'front' | 'side' | 'back';
  blob: Blob;
  takenAt: string;
}
