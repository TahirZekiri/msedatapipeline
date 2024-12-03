const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    const { issuer, timeframe } = req.query;
    const db = req.db;

    if (!issuer || !timeframe) {
        return res.status(400).json({ message: "Missing required parameters" });
    }

    try {
        const now = new Date();
        let startDate;

        if (timeframe === "This Year") {
            startDate = new Date(now.getFullYear(), 0, 1);
        } else if (timeframe === "This Month") {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (timeframe === "This Week") {
            const day = now.getDay();
            startDate = new Date(now.setDate(now.getDate() - day));
        }

        const data = await db
            .collection("stockData")
            .find({ issuer, date: { $gte: startDate.toISOString().split("T")[0] } })
            .sort({ date: 1 })
            .toArray();

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching stock data" });
    }
});

module.exports = router;