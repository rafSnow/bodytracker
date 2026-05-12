import Papa from 'papaparse';
import { BodyTrackerDB } from '../db/database';
import { CheckIn } from '../types/checkin';

export async function parseCSVForImport(file: File): Promise<{
  headers: string[];
  preview: Record<string, string>[];
  rowCount: number;
}> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const preview = results.data.slice(0, 5) as Record<string, string>[];
        const rowCount = results.data.length;
        resolve({ headers, preview, rowCount });
      },
      error: (err) => reject(err)
    });
  });
}

export async function importCSVCheckins(
  file: File,
  columnMapping: Record<string, keyof CheckIn>,
  db: BodyTrackerDB
): Promise<{ imported: number; errors: string[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        let importedCount = 0;
        const errors: string[] = [];

        for (const row of (results.data as any[])) {
          try {
            const checkin: Partial<CheckIn> = {
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            for (const [csvHeader, checkinKey] of Object.entries(columnMapping)) {
              const value = row[csvHeader];
              if (value !== undefined && value !== '') {
                if (checkinKey === 'date') {
                  // Try to parse date. CSV dates can be tricky.
                  const d = new Date(value);
                  if (isNaN(d.getTime())) {
                    throw new Error(`Data inválida: ${value}`);
                  }
                  checkin.date = d.toISOString();
                } else if (typeof value === 'string' && checkinKey !== 'notes') {
                  // Numeric fields
                  const num = parseFloat(value.replace(',', '.'));
                  if (!isNaN(num)) {
                    (checkin as any)[checkinKey] = num;
                  }
                } else {
                  (checkin as any)[checkinKey] = value;
                }
              }
            }

            if (!checkin.date || !checkin.weightKg) {
              throw new Error("Data e Peso são obrigatórios");
            }

            await db.checkins.add(checkin as CheckIn);
            importedCount++;
          } catch (err: any) {
            errors.push(`Erro na linha ${importedCount + errors.length + 1}: ${err.message}`);
          }
        }

        resolve({ imported: importedCount, errors });
      },
      error: (err) => reject(err)
    });
  });
}
