const connectDB = require('../db');

async function verifyDataCompleteness() {
    const db = await connectDB();
    const collection = db.collection("stockData");

    const issuers = await collection.distinct("issuer");

    for (const issuer of issuers) {
        console.log(`Verifying data for issuer: ${issuer}`);

        // Find the earliest and latest dates for this issuer
        const firstRecord = await collection.find({ issuer }).sort({ date: 1 }).limit(1).toArray();
        const lastRecord = await collection.find({ issuer }).sort({ date: -1 }).limit(1).toArray();

        if (firstRecord.length > 0 && lastRecord.length > 0) {
            const startDate = new Date(firstRecord[0].date);
            const endDate = new Date(lastRecord[0].date);

            console.log(`Date range for ${issuer}: ${startDate.toISOString().split("T")[0]} to ${endDate.toISOString().split("T")[0]}`);

            // Calculate the total expected days between start and end dates
            const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

            // Count actual records
            const recordCount = await collection.countDocuments({ issuer });

            if (recordCount === totalDays) {
                console.log(`Data is complete for ${issuer} with ${recordCount} records.`);
            } else {
                console.warn(`Data is incomplete for ${issuer}. Expected ${totalDays} records but found ${recordCount}.`);
            }
        } else {
            console.warn(`No data found for ${issuer}.`);
        }
    }

    console.log("Verification complete.");
}

verifyDataCompleteness().then(() => {
    console.log("Data completeness verification finished.");
    process.exit();
}).catch(error => {
    console.error("Error verifying data completeness:", error);
    process.exit(1);
});