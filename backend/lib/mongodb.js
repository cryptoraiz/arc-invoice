import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI not set, using localhost');
}

if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so the database connection
    // is preserved across hot reloads
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    // In production mode, create a new client for each request
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export default clientPromise;

// Helper function to get database
export async function getDatabase() {
    const client = await clientPromise;
    return client.db('arcpay');
}

// Helper function to get invoices collection
export async function getInvoicesCollection() {
    const db = await getDatabase();
    return db.collection('invoices');
}
