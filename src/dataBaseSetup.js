import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

export default async function dbSetup() {
    const mongoClient = new MongoClient(process.env.DATABASE_URL);
    try {
        const db = await mongoClient.connect();
        return db.db()
    } catch {
        console.log("deu ruim no dbSetup");
    }
}