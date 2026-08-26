import { MongoClient, type Db } from "mongodb";

declare global {
  // preserve connection across hot-reloads in dev

  var _mongoClient: MongoClient | undefined;
}

let client: MongoClient;

function getClient(): MongoClient {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is not set");

  if (globalThis._mongoClient) return globalThis._mongoClient;

  client = new MongoClient(uri, {
    connectTimeoutMS: 10_000,
    serverSelectionTimeoutMS: 10_000,
  });

  globalThis._mongoClient = client;
  return client;
}

let indexesEnsured = false;

async function ensureIndexes(db: Db): Promise<void> {
  if (indexesEnsured) return;
  indexesEnsured = true;
  // Run each index creation independently and swallow "already exists under a
  // different name" conflicts (code 85) — retrying that on every request just
  // adds latency without ever succeeding, since the index is already there.
  await Promise.all([
    db.collection("users").createIndex({ contact: 1 }, { unique: true }),
    db.collection("users").createIndex({ userId: 1 }),
    db.collection("admin_logs").createIndex({ timestamp: -1 }),
    db.collection("rate_limits").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]).catch((err) => {
    if (err?.code !== 85) {
      indexesEnsured = false;
      console.error("Failed to ensure indexes", err);
    }
  });
}

export async function getDb(): Promise<Db> {
  const c = getClient();
  await c.connect();
  // Db name comes from MONGODB_URI's path segment — do not hardcode a name here,
  // it must always match where the URI actually points.
  const db = c.db();
  void ensureIndexes(db);
  return db;
}
