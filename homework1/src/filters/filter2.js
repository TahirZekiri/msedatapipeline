// checking last date filter
async function filter2(issuer, db) {
    const collection = db.collection("stockData");

    // Get the last date for this issuer
    const lastEntry = await collection.findOne({ issuer }, { sort: { date: -1 } });

    if (lastEntry) {
        console.log(`Last recorded date for ${issuer}: ${lastEntry.date}`);
        return new Date(lastEntry.date);
    } else {
        // No data exists, start from 10 years ago
        const tenYearsAgo = new Date();
        tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
        console.log(`No data for ${issuer}. Starting from: ${tenYearsAgo.toISOString().split("T")[0]}`);
        return tenYearsAgo;
    }
}

module.exports = filter2;