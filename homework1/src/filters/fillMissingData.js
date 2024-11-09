// src/filters/fillMissingData.js
const axios = require("axios");
const cheerio = require("cheerio"); // We'll need this to parse the HTML response
const connectDB = require("../db");

async function fillMissingData(issuer, fromDate) {
    const db = await connectDB();
    const toDate = new Date(); // Use the current date

    // Function to format dates as "MM/DD/YYYY" which is the format expected by the website
    function formatDate(date) {
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }

    // Calculate the total number of years between fromDate and toDate
    let currentFromDate = new Date(fromDate);

    while (currentFromDate < toDate) {
        // Calculate the next date chunk (maximum 365 days ahead)
        let currentToDate = new Date(currentFromDate);
        currentToDate.setFullYear(currentToDate.getFullYear() + 1);

        // If currentToDate is after toDate, set it to toDate
        if (currentToDate > toDate) {
            currentToDate = new Date(toDate);
        }

        // Format dates
        const formattedFromDate = formatDate(currentFromDate);
        const formattedToDate = formatDate(currentToDate);

        console.log(`Fetching data for ${issuer} from ${formattedFromDate} to ${formattedToDate}`);

        try {
            // Make the POST request with the form data
            const response = await axios.post(
                `https://www.mse.mk/en/stats/symbolhistory/${issuer}`,
                new URLSearchParams({
                    FromDate: formattedFromDate,
                    ToDate: formattedToDate,
                    Code: issuer,
                }).toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            const html = response.data;
            const $ = cheerio.load(html);

            // Parse the table data
            const tableRows = $('#resultsTable tbody tr');
            const data = [];

            tableRows.each((index, element) => {
                const tds = $(element).find('td');
                if (tds.length === 9) {
                    const date = $(tds[0]).text().trim();
                    const lastTradePrice = $(tds[1]).text().trim();
                    const max = $(tds[2]).text().trim();
                    const min = $(tds[3]).text().trim();
                    const avgPrice = $(tds[4]).text().trim();
                    const percentageChange = $(tds[5]).text().trim();
                    const volume = $(tds[6]).text().trim();
                    const turnoverBest = $(tds[7]).text().trim();
                    const totalTurnover = $(tds[8]).text().trim();

                    data.push({
                        issuer,
                        date: new Date(date), // Convert to Date object
                        lastTradePrice: parseFloat(lastTradePrice.replace(/,/g, '')) || null,
                        max: parseFloat(max.replace(/,/g, '')) || null,
                        min: parseFloat(min.replace(/,/g, '')) || null,
                        avgPrice: parseFloat(avgPrice.replace(/,/g, '')) || null,
                        percentageChange: parseFloat(percentageChange.replace(/,/g, '')) || null,
                        volume: parseInt(volume.replace(/,/g, ''), 10) || 0,
                        turnoverBest: parseFloat(turnoverBest.replace(/,/g, '')) || 0,
                        totalTurnover: parseFloat(totalTurnover.replace(/,/g, '')) || 0,
                    });
                }
            });

            if (data.length > 0) {
                // Insert data into MongoDB
                await db.collection("stockData").insertMany(data, { ordered: false }).catch(error => {
                    if (error.code === 11000) {
                        console.log(`Duplicate entries found for ${issuer} in this date range. Skipping duplicates.`);
                    } else {
                        throw error;
                    }
                });
                console.log(`Data for ${issuer} from ${formattedFromDate} to ${formattedToDate} saved.`);
            } else {
                console.log(`No data found for ${issuer} from ${formattedFromDate} to ${formattedToDate}.`);
            }
        } catch (error) {
            console.error(`Error fetching data for ${issuer} from ${formattedFromDate} to ${formattedToDate}:`, error.message);
        }

        // Move to the next date chunk
        currentFromDate = new Date(currentToDate);
        currentFromDate.setDate(currentFromDate.getDate() + 1); // Start from the next day
    }
}

module.exports = fillMissingData;