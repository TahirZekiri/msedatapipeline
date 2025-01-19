// homework4/microservices/mstockOperations/routes/issuers.js
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    const db = req.db;
    try {
        const issuers = await db.collection("stockData").distinct("issuer");
        res.json(issuers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching issuers" });
    }
});

module.exports = router;