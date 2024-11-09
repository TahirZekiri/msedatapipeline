// src/main.js
const fetchIssuers = require("./filters/filter1");
const checkLastDate = require("./filters/filter2");
const fillMissingData = require("./filters/filter3");
const measureTime = require("./timer");

async function main() {
    try {
        const issuers = await fetchIssuers();

        if (issuers.length === 0) {
            console.log("No issuers found.");
            return;
        }

        // Process only the first issuer for testing
        const firstIssuer = issuers[0];
        console.log(`Processing data for issuer: ${firstIssuer.code}`);

        const lastDate = await checkLastDate(firstIssuer.code);
        await fillMissingData(firstIssuer.code, lastDate);

        console.log("Test pipeline complete for first issuer.");
    } catch (error) {
        console.error("Error in main pipeline:", error);
    }
}

measureTime(main).then(() => console.log("Process finished"));