import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Profile } from '../types/profile';
import type { CheckIn } from '../types/checkin';
import type { Photo } from '../types/photo';
import type { Goal } from '../types/goal';

export class BodyTrackerDB extends Dexie {
  profile!: Table<Profile>;
  checkins!: Table<CheckIn>;
  photos!: Table<Photo>;
  goals!: Table<Goal>;

  constructor() {
    super('BodyTrackerDB');
    this.version(1).stores({
      profile: '&id',
      checkins: '++id, date',
      photos: '++id, checkinId',
      goals: '&id',
    });
  }
}

export const db = new BodyTrackerDB();
