const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

const uri = "mongodb://localhost:27017";
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