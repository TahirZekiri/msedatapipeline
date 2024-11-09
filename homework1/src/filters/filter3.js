// the filter that fills the missing data
const axios = require("axios");
const cheerio = require("cheerio");

function formatMacedonianNumber(value) {
    return value !== null ? value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null;
}
function formatDate(date) {
    return date.toISOString().split("T")[0];
}

async function filter3(issuer, fromDate, db) {
    const toDate = new Date();
    let currentFromDate = new Date(fromDate);

    while (currentFromDate < toDate) {
        let currentToDate = new Date(currentFromDate);
        currentToDate.setFullYear(currentToDate.getFullYear() + 1);
        if (currentToDate > toDate) currentToDate = new Date(toDate);

        const formattedFromDate = formatDate(currentFromDate);
        const formattedToDate = formatDate(currentToDate);
        console.log(`Fetching data for ${issuer} from ${formattedFromDate} to ${formattedToDate}`);

        try {
            const response = await axios.post(`https://www.mse.mk/en/stats/symbolhistory/${issuer}`,
                new URLSearchParams({ FromDate: formattedFromDate, ToDate: formattedToDate, Code: issuer }).toString(),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );

            const html = response.data;
            const $ = cheerio.load(html);
            const tableRows = $('#resultsTable tbody tr');
            const data = [];

            tableRows.each((_, element) => {
                const tds = $(element).find('td');
                if (tds.length === 9) {
                    const date = formatDate(new Date($(tds[0]).text().trim()));
                    const lastTradePrice = parseFloat($(tds[1]).text().replace(/,/g, ''));
                    const max = parseFloat($(tds[2]).text().replace(/,/g, ''));
                    const min = parseFloat($(tds[3]).text().replace(/,/g, ''));
                    const volume = parseInt($(tds[6]).text().replace(/,/g, ''), 10) || 0;
                    const turnoverBest = parseFloat($(tds[7]).text().replace(/,/g, ''));
                    const formattedLastTradePrice = isNaN(lastTradePrice) ? null : formatMacedonianNumber(lastTradePrice);
                    const formattedMax = isNaN(max) ? null : formatMacedonianNumber(max);
                    const formattedMin = isNaN(min) ? null : formatMacedonianNumber(min);
                    const formattedTurnoverBest = isNaN(turnoverBest) ? null : formatMacedonianNumber(turnoverBest);

                    data.push({
                        issuer,
                        date,
                        lastTradePrice: formattedLastTradePrice,
                        max: formattedMax,
                        min: formattedMin,
                        volume,
                        turnoverBest: formattedTurnoverBest
                    });
                }
            });

            if (data.length > 0) {
                await db.collection("stockData").insertMany(data, { ordered: false });
                console.log(`Data for ${issuer} from ${formattedFromDate} to ${formattedToDate} saved.`);
            } else {
                console.log(`No data found for ${issuer} from ${formattedFromDate} to ${formattedToDate}.`);
            }
        } catch (error) {
            console.error(`Error fetching data for ${issuer} from ${formattedFromDate} to ${formattedToDate}:`, error.message);
        }

        currentFromDate = new Date(currentToDate);
        currentFromDate.setDate(currentFromDate.getDate() + 1);
    }
}

module.exports = filter3;