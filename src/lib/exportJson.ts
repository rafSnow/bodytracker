import { BodyTrackerDB } from '../db/database';
import { Profile } from '../types/profile';
import { CheckIn } from '../types/checkin';
import { Goal } from '../types/goal';

interface BackupData {
  version: number;
  exportedAt: string;
  profile: Profile | null;
  checkins: CheckIn[];
  goals: Goal | null;
  warning: string;
}

export async function exportBackupJSON(db: BodyTrackerDB): Promise<void> {
  const profile = await db.profile.get(1);
  const checkins = await db.checkins.toArray();
  const goals = await db.goals.get(1);

  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: profile || null,
    checkins: checkins,
    goals: goals || null,
    warning: "photos are not included in this backup"
  };

  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `body-tracker-backup-${new Date().toISOString().split('T')[0]}.json`);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    window.open(url);
  } else {
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export async function importBackupJSON(
  file: File,
  db: BodyTrackerDB,
  mode: 'replace' | 'merge'
): Promise<{ imported: number; errors: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const backup: BackupData = JSON.parse(content);

        if (mode === 'replace') {
          await db.profile.clear();
          await db.checkins.clear();
          await db.photos.clear();
          await db.goals.clear();
        }

        let importedCount = 0;
        const errors: string[] = [];

        if (backup.profile) {
          await db.profile.put(backup.profile);
          importedCount++;
        }

        if (backup.goals) {
          await db.goals.put(backup.goals);
          importedCount++;
        }

        if (backup.checkins && Array.isArray(backup.checkins)) {
          for (const checkin of backup.checkins) {
            try {
              // If merging, we might want to avoid duplicate IDs or just let Dexie auto-increment
              if (mode === 'merge') {
                const { id, ...checkinWithoutId } = checkin;
                await db.checkins.add(checkinWithoutId as CheckIn);
              } else {
                await db.checkins.put(checkin);
              }
              importedCount++;
            } catch (err) {
              errors.push(`Erro ao importar check-in de ${checkin.date}: ${err}`);
            }
          }
        }

        resolve({ imported: importedCount, errors });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
    reader.readAsText(file);
  });
}
