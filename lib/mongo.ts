import { MongoClient } from 'mongodb';

let client: MongoClient | null = null;

export async function getMongoClient() {
    const url = process.env.MONGODB_URI;

    if (!url) {
        return null;
    }

    if (client) {
        return client;
    }

    try {
        client = new MongoClient(url);
        await client.connect();
        console.log('Connected to MongoDB');
        return client;
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        throw error;
    }
}

export async function getMongoDb() {
    const client = await getMongoClient();
    const dbName = process.env.MONGODB_DB_NAME || 'rapid-flare';
    if (!client) return null;
    return client.db(dbName);
}
