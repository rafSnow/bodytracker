import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { Goal } from '../types/goal';

export function useGoal() {
  const goal = useLiveQuery(async () => {
    const res = await db.goals.get(1);
    return res || null;
  }, []);
  
  const loading = goal === undefined;

  const saveGoal = async (data: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newGoal: Goal = {
      ...data,
      id: 1,
      createdAt: now,
      updatedAt: now,
    };
    await db.goals.put(newGoal);
  };

  const deleteGoal = async () => {
    await db.goals.delete(1);
  };

  return {
    goal: goal || null,
    loading,
    saveGoal,
    deleteGoal,
  };
}
