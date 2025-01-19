//homework4/microservices/dataPipeline/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const filter1 = require("./filters/filter1");
const filter2 = require("./filters/filter2");
const filter3 = require("./filters/filter3");
const connectDB = require("./db");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

let db;

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

(async () => {
    db = await connectDB();

    app.get("/api/run-pipeline", async (req, res) => {
        try {
            console.log("Starting pipeline...");
            await runPipeline();
            res.status(200).json({ message: "Pipeline completed successfully." });
        } catch (error) {
            console.error("Pipeline error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    const PORT = process.env.PORT || 5012;
    app.listen(PORT, () => {
        console.log(`Data pipeline microservice running on http://localhost:${PORT}`);
    });
})();