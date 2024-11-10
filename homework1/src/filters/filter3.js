// the filter that fills the missing data
const axios = require("axios");
const cheerio = require("cheerio");

function formatDate(date) {
    return date.toISOString().split("T")[0];
}

async function fetchDataWithRetries(url, params, maxRetries = 3, delay = 2000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await axios.post(url, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
        } catch (error) {
            if (error.response && error.response.status === 503 && attempt < maxRetries) {
                console.warn(`Retry ${attempt} for ${url} after 503 error...`);
                await new Promise(res => setTimeout(res, delay));
            } else {
                throw error;
            }
        }
    }
    throw new Error(`Failed to fetch data from ${url} after ${maxRetries} retries.`);
}

async function filter3(issuer, startDate, db) {
    const toDate = new Date();
    toDate.setUTCHours(0, 0, 0, 0);

    if (!startDate || startDate >= toDate) {
        console.log(`No new data needed for ${issuer} as it is already up-to-date.`);
        return;
    }

    let currentFromDate = new Date(startDate);
    currentFromDate.setUTCHours(0, 0, 0, 0);

    while (currentFromDate <= toDate) {
        let currentToDate = new Date(currentFromDate);
        currentToDate.setDate(currentToDate.getDate() + 364);
        if (currentToDate > toDate) currentToDate = new Date(toDate);

        const formattedFromDate = formatDate(currentFromDate);
        const formattedToDate = formatDate(currentToDate);

        try {
            const response = await fetchDataWithRetries(
                `https://www.mse.mk/en/stats/symbolhistory/${issuer}`,
                new URLSearchParams({ FromDate: formattedFromDate, ToDate: formattedToDate, Code: issuer }).toString()
            );

            const html = response.data;
            const $ = cheerio.load(html);
            const tableRows = $('#resultsTable tbody tr');
            const data = [];

            tableRows.each((_, element) => {
                const tds = $(element).find('td');
                if (tds.length === 9) {
                    const parsedDateString = $(tds[0]).text().trim();
                    const [month, day, year] = parsedDateString.split('/');
                    const parsedDate = new Date(Date.UTC(year, month - 1, day));
                    const date = formatDate(parsedDate);

                    if (parsedDate >= currentFromDate && parsedDate <= currentToDate) {
                        const lastTradePrice = parseFloat($(tds[1]).text().replace(/,/g, ''));
                        const max = parseFloat($(tds[2]).text().replace(/,/g, ''));
                        const min = parseFloat($(tds[3]).text().replace(/,/g, ''));
                        const volume = parseInt($(tds[6]).text().replace(/,/g, ''), 10) || 0;
                        const turnoverBest = parseFloat($(tds[7]).text().replace(/,/g, ''));

                        data.push({
                            issuer,
                            date,
                            lastTradePrice: isNaN(lastTradePrice) ? null : lastTradePrice,
                            max: isNaN(max) ? null : max,
                            min: isNaN(min) ? null : min,
                            volume,
                            turnoverBest: isNaN(turnoverBest) ? null : turnoverBest
                        });
                    }
                }
            });

            if (data.length > 0) {
                await db.collection("stockData").insertMany(data, { ordered: false });
                console.log(`Data for ${issuer} from ${formattedFromDate} to ${formattedToDate} saved.`);
            } else {
                console.log(`No new data to add for ${issuer} from ${formattedFromDate} to ${formattedToDate}.`);
            }
        } catch (error) {
            console.error(`Error fetching data for ${issuer} from ${formattedFromDate} to ${formattedToDate}:`, error.message);
        }

        currentFromDate = new Date(currentToDate);
        currentFromDate.setDate(currentFromDate.getDate() + 1);
        currentFromDate.setUTCHours(0, 0, 0, 0);
    }
}

module.exports = filter3;