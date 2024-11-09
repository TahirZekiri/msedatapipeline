// src/db.js
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB!");
        return client.db("stockMarketDB");
    } catch (error) {
        console.error("Could not connect to MongoDB", error);
        throw error;
    }
}

module.exports = connectDB;