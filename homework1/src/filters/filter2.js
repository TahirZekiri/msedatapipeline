// checking last date filter
async function filter2(issuer, db) {
    const collection = db.collection("stockData");

    // Retrieve the latest date entry for the given issuer
    const lastEntry = await collection.findOne({ issuer }, { sort: { date: -1 } });

    if (lastEntry) {
        const lastDate = new Date(lastEntry.date);
        const today = new Date();

        // If the last date is already today or later, no new data is needed
        if (lastDate >= today) {
            console.log(`No new data needed for ${issuer} as it is already up-to-date.`);
            return null;
        }

        // Otherwise, start fetching from the day after the last recorded date
        const startDate = new Date(lastDate);
        startDate.setDate(startDate.getDate() + 1);
        console.log(`Fetching new data for ${issuer} from ${startDate.toISOString().split("T")[0]}`);
        return startDate;
    } else {
        // No data for this issuer; start from 10 years ago
        const tenYearsAgo = new Date();
        tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
        console.log(`No data for ${issuer}. Starting from 10 years back: ${tenYearsAgo.toISOString().split("T")[0]}`);
        return tenYearsAgo;
    }
}

module.exports = filter2;