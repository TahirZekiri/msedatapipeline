// src/main.js
const filter1 = require("./filters/filter1");
const filter2 = require("./filters/filter2");
const filter3 = require("./filters/filter3");
const measureTime = require("./timer");
const connectDB = require("./db");

async function main() {
    const db = await connectDB();
    const issuers = await filter1();

    if (issuers.length === 0) {
        console.log("No issuers found.");
        return;
    }

    console.log(`Processing data for ${issuers.length} issuers in parallel...`);
    await Promise.all(
        issuers.map(async (issuer) => {
            const lastDate = await filter2(issuer.code, db);
            await filter3(issuer.code, lastDate, db);
        })
    );

    console.log("Pipeline complete for all issuers.");
}

measureTime(main).then(() => console.log("Process finished"));