// homework4/microservices/mstockOperations/routes/technicalAnalysis.js
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    const { issuer, indicator, period } = req.query;
    const db = req.db;

    if (!issuer || !indicator || !period) {
        return res.status(400).json({ message: "Missing required parameters" });
    }

    try {
        const today = new Date();

        const periodStartDate = calculatePeriodStartDate(period);
        if (!periodStartDate) {
            return res.status(400).json({ message: "Invalid period" });
        }

        const stockData = await fetchStockData(db, issuer, periodStartDate, today);
        if (!stockData.length) {
            return res.status(404).json({ message: "No stock data found for the specified period." });
        }

        const processedData = processIndicator(indicator, stockData);
        if (!processedData) {
            return res.status(400).json({ message: "Invalid indicator type" });
        }

        res.json(processedData);
    } catch (error) {
        console.error("Error calculating indicators:", error);
        res.status(500).json({ message: "Error calculating indicators", error: error.message });
    }
});

function calculatePeriodStartDate(period) {
    const today = new Date();
    switch (period) {
        case "1 Day":
            return new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
        case "1 Week":
            return new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        case "1 Month": {
            const date = new Date(today);
            date.setMonth(date.getMonth() - 1);

            if (date.getDate() !== today.getDate()) {
                date.setDate(0);
            }
            return date;
        }
        default:
            return null;
    }
}

async function fetchStockData(db, issuer, periodStartDate, today) {
    const formattedPeriodStartDate = periodStartDate.toISOString().split("T")[0];
    const formattedEndDate = today.toISOString().split("T")[0];

    return await db
        .collection("stockData")
        .find({
            issuer,
            date: { $gte: formattedPeriodStartDate, $lte: formattedEndDate },
        })
        .sort({ date: 1 })
        .toArray();
}

function processIndicator(indicator, stockData) {
    let result = [];
    switch (indicator) {
        case "SMA":
            result = calculateSMA(stockData, 14);
            break;
        case "EMA":
            result = calculateEMA(stockData, 14);
            break;
        case "RSI":
            result = calculateRSI(stockData, 14);
            break;
        case "WMA":
            result = calculateWMA(stockData, 14);
            break;
        case "HMA":
            result = calculateHMA(stockData, 14);
            break;
        case "MACD":
            result = calculateMACD(stockData);
            break;
        case "Stochastic":
            result = calculateStochastic(stockData, 14);
            break;
        case "CCI":
            result = calculateCCI(stockData, 14);
            break;
        case "ATR":
            result = calculateATR(stockData, 14);
            break;
        case "WilliamsR":
            result = calculateWilliamsR(stockData, 14);
            break;
        default:
            return null;
    }

    return result.map((dataPoint) => ({
        date: dataPoint.date,
        value: dataPoint.value,
        signal: dataPoint.signal || "Hold",
    }));
}

function deduplicateByDate(data) {
    const seenDates = new Set();
    return data.filter((item) => {
        if (seenDates.has(item.date)) return false;
        seenDates.add(item.date);
        return true;
    });
}

function fillMissingDays(data) {
    const filledData = [];
    const dateMap = new Map();

    data.forEach((item) => {
        dateMap.set(item.date, item);
    });

    const sortedDates = data.map((d) => new Date(d.date)).sort((a, b) => a - b);
    const startDate = sortedDates[0];
    const endDate = sortedDates[sortedDates.length - 1];

    for (
        let currentDate = new Date(startDate);
        currentDate <= endDate;
        currentDate.setDate(currentDate.getDate() + 1)
    ) {
        const formattedDate = currentDate.toISOString().split("T")[0];
        filledData.push(dateMap.get(formattedDate) || { ...filledData[filledData.length - 1], date: formattedDate });
    }
    return filledData;
}

function safeParsePrice(price) {
    if (!price || price === "null") return 0;
    return parseFloat(price.replace(/\./g, "").replace(",", "."));
}

function calculateSMA(data, length) {
    const filledData = fillMissingDays(deduplicateByDate(data));
    return filledData.slice(length - 1).map((_, i) => {
        const subset = filledData.slice(i, i + length);
        const avg = subset.reduce((sum, d) => sum + safeParsePrice(d.lastTradePrice), 0) / length;
        const signal = avg > safeParsePrice(filledData[i + length - 1].lastTradePrice) ? "Buy" : "Sell";
        return { date: filledData[i + length - 1].date, value: avg, signal };
    });
}

function calculateEMA(data, length) {
    const filledData = fillMissingDays(deduplicateByDate(data));
    const multiplier = 2 / (length + 1);
    let prevEma = safeParsePrice(filledData[0].lastTradePrice);

    return filledData.map((item, index) => {
        const price = safeParsePrice(item.lastTradePrice);
        const ema = index === 0 ? prevEma : (price - prevEma) * multiplier + prevEma;
        prevEma = ema;

        const signal = ema > price ? "Buy" : "Sell";
        return { date: item.date, value: ema, signal };
    });
}

function calculateRSI(data, length) {
    const filledData = fillMissingDays(deduplicateByDate(data));
    let gains = 0, losses = 0;
    const result = [];

    filledData.forEach((item, i) => {
        if (i === 0) return;

        const prevClose = safeParsePrice(filledData[i - 1].lastTradePrice);
        const currentClose = safeParsePrice(item.lastTradePrice);
        const change = currentClose - prevClose;

        if (i < length) {
            change > 0 ? (gains += change) : (losses += Math.abs(change));
        } else {
            const avgGain = gains / length;
            const avgLoss = losses / length;
            const rs = avgGain / avgLoss;
            const rsi = 100 - 100 / (1 + rs);

            const signal = rsi > 70 ? "Sell" : rsi < 30 ? "Buy" : "Hold";
            result.push({ date: item.date, value: rsi, signal });

            const oldChange = safeParsePrice(filledData[i - length].lastTradePrice) - safeParsePrice(filledData[i - length - 1]?.lastTradePrice || 0);
            oldChange > 0 ? (gains -= oldChange) : (losses -= Math.abs(oldChange));
            change > 0 ? (gains += change) : (losses += Math.abs(change));
        }
    });

    return result;
}

function calculateWMA(data, length) {
    const filledData = fillMissingDays(deduplicateByDate(data));
    const result = [];
    const weights = Array.from({ length }, (_, i) => i + 1);

    for (let i = length - 1; i < filledData.length; i++) {
        const subset = filledData.slice(i - length + 1, i + 1);
        const weightedSum = subset.reduce(
            (sum, d, idx) => sum + safeParsePrice(d.lastTradePrice) * weights[idx],
            0
        );
        const divisor = weights.reduce((a, b) => a + b, 0);
        result.push({ date: filledData[i].date, value: weightedSum / divisor });
    }
    return result;
}

function calculateHMA(data, length) {
    const halfLength = Math.floor(length / 2);
    const sqrtLength = Math.sqrt(length);
    const wmaHalf = calculateWMA(data, halfLength);
    const wmaFull = calculateWMA(data, length);

    const diffWMA = wmaHalf.map((w, i) => ({
        date: w.date,
        value: 2 * w.value - wmaFull[i].value,
    }));
    return calculateWMA(diffWMA, Math.floor(sqrtLength));
}

function calculateMACD(data) {
    const ema12 = calculateEMA(data, 12);
    const ema26 = calculateEMA(data, 26);

    return ema12.map((e12, i) => ({
        date: e12.date,
        value: e12.value - ema26[i].value,
    }));
}

function calculateStochastic(data, length) {
    const filledData = fillMissingDays(deduplicateByDate(data));
    return filledData.slice(length - 1).map((_, i) => {
        const subset = filledData.slice(i, i + length);
        const high = Math.max(...subset.map((d) => safeParsePrice(d.max)));
        const low = Math.min(...subset.map((d) => safeParsePrice(d.min)));
        const close = safeParsePrice(filledData[i + length - 1].lastTradePrice);
        const stochastic = ((close - low) / (high - low)) * 100;
        return { date: filledData[i + length - 1].date, value: stochastic };
    });
}

function calculateCCI(data, length) {
    const filledData = fillMissingDays(deduplicateByDate(data));
    const result = [];
    for (let i = length - 1; i < filledData.length; i++) {
        const subset = filledData.slice(i - length + 1, i + 1);
        const typicalPrices = subset.map((d) =>
            (safeParsePrice(d.max) + safeParsePrice(d.min) + safeParsePrice(d.lastTradePrice)) / 3
        );
        const avg = typicalPrices.reduce((a, b) => a + b, 0) / typicalPrices.length;
        const meanDeviation = typicalPrices.reduce((sum, tp) => sum + Math.abs(tp - avg), 0) / typicalPrices.length;
        const cci = (typicalPrices[typicalPrices.length - 1] - avg) / (0.015 * meanDeviation);
        result.push({ date: filledData[i].date, value: cci, signal: "Hold" });
    }
    return result;
}

function calculateATR(data, length) {
    const filledData = fillMissingDays(deduplicateByDate(data));
    const result = [];
    for (let i = 1; i < filledData.length; i++) {
        const high = safeParsePrice(filledData[i].max);
        const low = safeParsePrice(filledData[i].min);
        const prevClose = safeParsePrice(filledData[i - 1].lastTradePrice);
        const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));

        if (i < length) continue;

        const atr = result.slice(i - length, i).reduce((sum, r) => sum + r.value, 0) / length;
        result.push({ date: filledData[i].date, value: atr });
    }
    return result;
}

function calculateWilliamsR(data, length) {
    const filledData = fillMissingDays(deduplicateByDate(data));
    return filledData.slice(length - 1).map((_, i) => {
        const subset = filledData.slice(i, i + length);
        const high = Math.max(...subset.map((d) => safeParsePrice(d.max)));
        const low = Math.min(...subset.map((d) => safeParsePrice(d.min)));
        const close = safeParsePrice(filledData[i + length - 1].lastTradePrice);
        const williamsR = ((high - close) / (high - low)) * -100;
        return { date: filledData[i + length - 1].date, value: williamsR };
    });
}

module.exports = router;