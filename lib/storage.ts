import fs from 'fs/promises';
import path from 'path';
import { AppData, Entry } from './types';
import { getMongoDb } from './mongo';

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

async function getLocalData(): Promise<AppData> {
    await ensureDb();
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
}

export async function getData(): Promise<AppData> {
    if (process.env.MONGODB_URI) {
        try {
            const db = await getMongoDb();
            if (db) {
                const settings = await db.collection('settings').findOne({});
                const entries = await db.collection('entries').find({}).toArray();

                // If no settings found in Mongo, try to get from local or default
                let appSettings = settings as any;
                if (!appSettings) {
                    const localData = await getLocalData();
                    appSettings = localData.settings;
                }

                return {
                    settings: {
                        dailyGoal: appSettings.dailyGoal || 2000,
                        proteinGoal: appSettings.proteinGoal || 150,
                        carbsGoal: appSettings.carbsGoal || 250,
                        fatGoal: appSettings.fatGoal || 70,
                        userStats: appSettings.userStats,
                        apiBaseUrl: appSettings.apiBaseUrl
                    },
                    entries: entries.map((e: any) => ({
                        ...e,
                        id: e.id || e._id.toString()
                    })) as Entry[]
                };
            }
        } catch (e) {
            console.error("Failed to fetch from MongoDB, falling back to local", e);
        }
    }
    return getLocalData();
}

export async function saveData(data: AppData): Promise<void> {
    if (process.env.MONGODB_URI) {
        try {
            const db = await getMongoDb();
            if (db) {
                // Upsert settings. We assume one settings document.
                // We use updateOne with upsert: true and a fixed query (e.g., empty or specific ID)
                // But since we don't have a specific ID, let's just use an empty filter and assume singleton.
                // Better approach: check if exists, if not insert. Or use a constant ID.
                // For simplicity, let's assume we just update the first found or insert.
                const count = await db.collection('settings').countDocuments();
                if (count === 0) {
                    await db.collection('settings').insertOne(data.settings);
                } else {
                    await db.collection('settings').replaceOne({}, data.settings);
                }

                // Note: We are NOT saving entries here to avoid overwriting the entire collection.
                // Entries are managed individually via addEntry/deleteEntry.
                return;
            }
        } catch (e) {
            console.error("Failed to save to MongoDB, falling back to local", e);
        }
    }

    // Fallback to local file
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

export async function addEntry(entry: Entry): Promise<void> {
    if (process.env.MONGODB_URI) {
        try {
            const db = await getMongoDb();
            if (db) {
                await db.collection('entries').insertOne(entry);
                return;
            }
        } catch (e) {
            console.error("Failed to save to MongoDB, falling back to local", e);
        }
    }

    const data = await getLocalData();
    data.entries.push(entry);
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
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
    if (process.env.MONGODB_URI) {
        try {
            const db = await getMongoDb();
            if (db) {
                await db.collection('entries').deleteOne({ id: id });
                return;
            }
        } catch (e) {
            console.error("Failed to delete from MongoDB, falling back to local", e);
        }
    }

    const data = await getLocalData();
    data.entries = data.entries.filter(e => e.id !== id);
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}
