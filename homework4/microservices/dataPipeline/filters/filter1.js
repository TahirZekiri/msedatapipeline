// data fetching filter
const axios = require("axios");
const cheerio = require("cheerio");

async function filter1() {
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
    return issuers;
}

module.exports = filter1;