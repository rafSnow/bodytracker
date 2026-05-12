import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { CheckIn } from '../types/checkin';

export function useCheckins() {
  const checkins = useLiveQuery(() => db.checkins.orderBy('date').reverse().toArray());
  const loading = checkins === undefined;

  const addCheckin = async (data: Omit<CheckIn, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const id = await db.checkins.add({
      ...data,
      createdAt: now,
      updatedAt: now,
    } as CheckIn);
    return id;
  };

  const updateCheckin = async (id: number, data: Partial<CheckIn>) => {
    const now = new Date().toISOString();
    await db.checkins.update(id, {
      ...data,
      updatedAt: now,
    });
  };

  const deleteCheckin = async (id: number) => {
    // RN09: Excluir fotos ao excluir check-in
    await db.photos.where('checkinId').equals(id).delete();
    await db.checkins.delete(id);
  };

  const getCheckinById = async (id: number) => {
    return await db.checkins.get(id);
  };

  const getLatestCheckin = async () => {
    return await db.checkins.orderBy('date').reverse().first();
  };

  const getCheckinsInRange = async (from: Date, to: Date) => {
    return await db.checkins
      .where('date')
      .between(from.toISOString(), to.toISOString(), true, true)
      .toArray();
  };

  const getPaginatedCheckins = async (page: number, pageSize: number, from?: Date, to?: Date) => {
    let query = db.checkins.orderBy('date').reverse();

    if (from || to) {
      const fromStr = from ? from.toISOString() : '0000-00-00T00:00:00.000Z';
      const toStr = to ? to.toISOString() : '9999-12-31T23:59:59.999Z';
      // Dexie doesn't support where().between() on reverse order directly easily with pagination
      // So we filter then paginate
      const filtered = await db.checkins
        .where('date')
        .between(fromStr, toStr, true, true)
        .reverse()
        .offset(page * pageSize)
        .limit(pageSize)
        .toArray();

      const total = await db.checkins
        .where('date')
        .between(fromStr, toStr, true, true)
        .count();

      return {
        data: filtered,
        total,
        hasMore: (page + 1) * pageSize < total,
      };
    }

    const data = await query
      .offset(page * pageSize)
      .limit(pageSize)
      .toArray();

    const total = await db.checkins.count();

    return {
      data,
      total,
      hasMore: (page + 1) * pageSize < total,
    };
  };

  return {
    checkins: checkins || [],
    loading,
    addCheckin,
    updateCheckin,
    deleteCheckin,
    getCheckinById,
    getLatestCheckin,
    getCheckinsInRange,
    getPaginatedCheckins,
  };
}
