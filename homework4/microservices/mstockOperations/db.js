//homework4/microservices/dataPipeline/db.js
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

const uri = process.env.MONGO_URI;
let dbInstance = null;

async function connectDB() {
    if (dbInstance) return dbInstance;

    const client = new MongoClient(uri);
    await client.connect();
    console.log("Connected to MongoDB!");
    dbInstance = client.db("stockDB");
    return dbInstance;
}

module.exports = connectDB;