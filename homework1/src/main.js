// src/main.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const filter1 = require("./filters/filter1");
const filter2 = require("./filters/filter2");
const filter3 = require("./filters/filter3");
const measureTime = require("./timer");
const connectDB = require("./db");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

let db;

// Function to handle pipeline processing
async function runPipeline() {
    const issuers = await filter1();

    if (issuers.length === 0) {
        console.log("No issuers found.");
        return;
    }

    console.log(`Processing data for ${issuers.length} issuers in parallel...`);
    await Promise.all(
        issuers.map(async (issuer) => {
            const lastDate = await filter2(issuer.code, db);
            await filter3(issuer.code, lastDate, db);
        })
    );

    console.log("Pipeline complete for all issuers.");
}

// Connecting to the database and initializing both the pipeline and the server
(async () => {
    db = await connectDB();

    console.log("Starting pipeline...");
    measureTime(runPipeline).then(() => console.log("Pipeline processing finished."));

    const issuersRoutes = require("../../homework3/routes/issuers");
    const stockDataRoutes = require("../../homework3/routes/stockData");
    const technicalAnalysisRoutes = require("../../homework3/routes/technicalAnalysis");

    app.use("/api/issuers", (req, res, next) => {
        req.db = db;
        next();
    }, issuersRoutes);

    app.use("/api/stockData", (req, res, next) => {
        req.db = db;
        next();
    }, stockDataRoutes);

    app.use("/api/technicalAnalysis", (req, res, next) => {
        req.db = db;
        next();
    }, technicalAnalysisRoutes);

    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
})();

async function main() {
    const db = await connectDB();
    const issuers = await filter1();

    if (issuers.length === 0) {
        console.log("No issuers found.");
        return;
    }

    console.log(`Processing data for ${issuers.length} issuers in parallel...`);
    await Promise.all(
        issuers.map(async (issuer) => {
            const lastDate = await filter2(issuer.code, db);
            await filter3(issuer.code, lastDate, db);
        })
    );

    console.log("Pipeline complete for all issuers.");
}

measureTime(main).then(() => console.log("Process finished"));