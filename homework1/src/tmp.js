const axios = require("axios");
const cheerio = require("cheerio");
const { MongoClient } = require("mongodb");

const issuerCode = "TKVS";  // Replace with the actual issuer code
const uri = "mongodb://localhost:27017";
const dbName = "stockDB";
const collectionName = "stockData";

function formatDate(date) {
    return date.toISOString().split("T")[0];
}

async function fetchData(issuer, startDate, endDate) {
    const data = [];
    let currentFromDate = new Date(startDate);

    while (currentFromDate < endDate) {
        let currentToDate = new Date(currentFromDate);
        currentToDate.setDate(currentToDate.getDate() + 364);
        if (currentToDate > endDate) currentToDate = new Date(endDate);

        const formattedFromDate = formatDate(currentFromDate);
        const formattedToDate = formatDate(currentToDate);
        console.log(`Fetching data for ${issuer} from ${formattedFromDate} to ${formattedToDate}`);

        try {
            const response = await axios.post(
                `https://www.mse.mk/en/stats/symbolhistory/${issuer}`,
                new URLSearchParams({ FromDate: formattedFromDate, ToDate: formattedToDate, Code: issuer }).toString(),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );

            const html = response.data;
            const $ = cheerio.load(html);
            const tableRows = $('#resultsTable tbody tr');

            tableRows.each((_, element) => {
                const tds = $(element).find('td');
                if (tds.length === 9) {
                    const date = formatDate(new Date($(tds[0]).text().trim()));
                    data.push(date);
                }
            });
        } catch (error) {
            console.error(`Error fetching data for ${issuer} from ${formattedFromDate} to ${formattedToDate}:`, error.message);
        }

        currentFromDate = new Date(currentToDate);
        currentFromDate.setDate(currentFromDate.getDate() + 1);
    }

    return data;
}

async function checkDatabaseDates(issuer, db) {
    const collection = db.collection(collectionName);
    const datesInDb = await collection
        .find({ issuer })
        .project({ date: 1, _id: 0 })
        .toArray();

    return datesInDb.map(entry => entry.date);
}

async function main() {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 10);

    console.log(`Fetching data for issuer ${issuerCode} from ${startDate.toISOString().split("T")[0]} to ${endDate.toISOString().split("T")[0]}`);

    // Step 1: Fetch dates from the MSE site
    const fetchedDates = await fetchData(issuerCode, startDate, endDate);
    console.log(`Fetched dates (${fetchedDates.length}):`, fetchedDates);

    // Step 2: Fetch dates from the database
    const dbDates = await checkDatabaseDates(issuerCode, db);
    console.log(`Database dates (${dbDates.length}):`, dbDates);

    // Step 3: Check for missing or duplicate dates
    const fetchedDatesSet = new Set(fetchedDates);
    const dbDatesSet = new Set(dbDates);

    const missingDates = [...fetchedDatesSet].filter(date => !dbDatesSet.has(date));
    const extraDates = [...dbDatesSet].filter(date => !fetchedDatesSet.has(date));
    const duplicateDates = dbDates.filter((date, index) => dbDates.indexOf(date) !== index);

    if (missingDates.length > 0) {
        console.log("Missing dates in the database:", missingDates);
    } else {
        console.log("No missing dates in the database.");
    }

    if (extraDates.length > 0) {
        console.log("Extra dates in the database (not fetched):", extraDates);
    } else {
        console.log("No extra dates in the database.");
    }

    if (duplicateDates.length > 0) {
        console.log("Duplicate dates in the database:", duplicateDates);
    } else {
        console.log("No duplicate dates in the database.");
    }

    await client.close();
}

main().then(() => console.log("Check complete")).catch(error => console.error("Error in check:", error));
