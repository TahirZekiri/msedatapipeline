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
        let currentStartDate, currentEndDate, previousStartDate, previousEndDate;

        if (timeframe === "This Year") {
            currentStartDate = new Date(now.getFullYear(), 0, 1);
            previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
            previousEndDate = new Date(now.getFullYear(), 0, 0);
        } else if (timeframe === "This Month") {
            currentStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
            previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
        } else if (timeframe === "This Week") {
            const day = now.getDay();
            currentStartDate = new Date(now.setDate(now.getDate() - day));
            previousStartDate = new Date(now.setDate(now.getDate() - 7));
            previousEndDate = new Date(currentStartDate.setDate(currentStartDate.getDate() - 1));
        }

        currentEndDate = new Date();

        const currentData = await db
            .collection("stockData")
            .find({
                issuer,
                date: { $gte: currentStartDate.toISOString().split("T")[0], $lte: currentEndDate.toISOString().split("T")[0] }
            })
            .sort({ date: -1 })
            .toArray();

        const previousData = await db
            .collection("stockData")
            .find({
                issuer,
                date: { $gte: previousStartDate.toISOString().split("T")[0], $lte: previousEndDate.toISOString().split("T")[0] }
            })
            .sort({ date: -1 })
            .toArray();

        res.json({ currentData, previousData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching stock data" });
    }
});

module.exports = router;