import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function getDb() {
  const client = await clientPromise;
  return client.db('mahjong_bookkeeper');
}

export async function addSession({ userId, amount, note }) {
  const db = await getDb();
  const doc = {
    userId,
    amount,
    note: note || '',
    date: new Date().toISOString().slice(0, 10),
    createdAt: new Date(),
  };
  const result = await db.collection('sessions').insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

/**
 * 获取时间段内的所有战绩，并计算统计
 */
export async function getStats({ userId, startDate, endDate }) {
  const db = await getDb();
  const sessions = await db
    .collection('sessions')
    .find({ userId, date: { $gte: startDate, $lte: endDate } })
    .sort({ createdAt: -1 })
    .toArray();

  const total = sessions.length;
  const wins = sessions.filter((s) => s.amount > 0).length;
  const losses = sessions.filter((s) => s.amount < 0).length;
  const totalPnL = sessions.reduce((sum, s) => sum + s.amount, 0);

  return {
    sessions,
    total,
    wins,
    losses,
    winRate: total > 0 ? wins / total : 0,
    totalPnL,
  };
}

export async function getRecent({ userId, limit = 10 }) {
  const db = await getDb();
  return db
    .collection('sessions')
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

export async function deleteSession({ userId, amount }) {
  const db = await getDb();
  const result = await db.collection('sessions').findOneAndDelete(
    { userId, amount },
    { sort: { createdAt: -1 } }
  );
  return result;
}
