// checking last date filter
async function filter2(issuer, db) {
    const collection = db.collection("stockData");

    const lastEntry = await collection.findOne({ issuer }, { sort: { date: -1 } });

    if (lastEntry) {
        const startDate = new Date(lastEntry.date);
        startDate.setDate(startDate.getDate() + 1);
        const today = new Date();
        if (startDate >= today) {
            return null;
        }
        return startDate;
    } else {
        const tenYearsAgo = new Date();
        tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
        return tenYearsAgo;
    }
}

module.exports = filter2;