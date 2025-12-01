import fs from 'fs/promises';
import path from 'path';
import { AppData, Entry } from './types';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

async function ensureDb() {
    try {
        await fs.access(DB_PATH);
    } catch {
        const initialData: AppData = {
            settings: {
                dailyGoal: 2000,
                proteinGoal: 150,
                carbsGoal: 250,
                fatGoal: 70
            },
            entries: [],
        };
        await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2));
    }
}

export async function getData(): Promise<AppData> {
    await ensureDb();
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
}

export async function saveData(data: AppData): Promise<void> {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

export async function addEntry(entry: Entry): Promise<void> {
    const data = await getData();
    data.entries.push(entry);
    await saveData(data);
}

export async function getEntries(): Promise<Entry[]> {
    const data = await getData();
    return data.entries;
}

export async function updateGoal(goal: number): Promise<void> {
    const data = await getData();
    data.settings.dailyGoal = goal;
    await saveData(data);
}

export async function deleteEntry(id: string): Promise<void> {
    const data = await getData();
    data.entries = data.entries.filter(e => e.id !== id);
    await saveData(data);
}
