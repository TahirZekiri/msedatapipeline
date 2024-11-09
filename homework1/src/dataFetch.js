// src/dataFetch.js
const axios = require("axios");
const cheerio = require("cheerio");
const connectDB = require("./db");

async function fetchIssuers() {
    try {
        const response = await axios.get("https://www.mse.mk/en/stats/symbolhistory/TEL");
        const html = response.data;
        const $ = cheerio.load(html);

        const issuers = [];
        $("#Code option").each((_, element) => {
            const issuerCode = $(element).attr("value");
            if (issuerCode && !issuerCode.match(/\d/)) {
                issuers.push({ code: issuerCode });
            }
        });

        console.log("Fetched Issuers:", issuers);

        // Connect to MongoDB and check for existing issuers
        const db = await connectDB();
        const collection = db.collection("issuers");

        // Only insert issuers if they don't already exist in the database
        for (const issuer of issuers) {
            const exists = await collection.findOne({ code: issuer.code });
            if (!exists) {
                await collection.insertOne(issuer);
            }
        }

        console.log("Issuers checked and saved to MongoDB if not already present.");
        return issuers;
    } catch (error) {
        console.error("Error fetching issuers:", error);
    }
}

module.exports = fetchIssuers;