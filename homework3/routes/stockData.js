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

router.get("/most-traded-stock", async (req, res) => {
    const { timeframe } = req.query;
    const db = req.db;

    if (!timeframe) {
        return res.status(400).json({ message: "Missing required parameters" });
    }

    try {
        const now = new Date();
        let currentStartDate, currentEndDate;
        let previousStartDate, previousEndDate;

        if (timeframe === "This Year") {
            currentStartDate = new Date(now.getFullYear(), 0, 1);
            currentEndDate = new Date();
            previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
            previousEndDate = new Date(now.getFullYear(), 0, 0);
        } else if (timeframe === "This Month") {
            currentStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
            currentEndDate = new Date();
            previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
        } else if (timeframe === "This Week") {
            const dayOfWeek = now.getDay();
            const currentWeekStart = new Date(now);
            currentWeekStart.setDate(now.getDate() - dayOfWeek);
            currentStartDate = currentWeekStart;
            currentEndDate = new Date();

            const previousWeekEnd = new Date(currentWeekStart);
            previousWeekEnd.setDate(previousWeekEnd.getDate() - 1);

            const previousWeekStart = new Date(previousWeekEnd);
            previousWeekStart.setDate(previousWeekStart.getDate() - 6);

            previousStartDate = previousWeekStart;
            previousEndDate = previousWeekEnd;
        } else {
            return res.status(400).json({ message: "Invalid timeframe" });
        }

        const commonPipeline = [
            {
                $addFields: {
                    priceWithoutThousands: {
                        $replaceAll: {
                            input: "$lastTradePrice",
                            find: ".",
                            replacement: ""
                        }
                    }
                }
            },
            {
                $addFields: {
                    priceFormatted: {
                        $replaceAll: {
                            input: "$priceWithoutThousands",
                            find: ",",
                            replacement: "."
                        }
                    }
                }
            },
            {
                $addFields: {
                    numericPrice: { $toDouble: "$priceFormatted" },
                    numericVolume: { $toInt: "$volume" }
                }
            }
        ];

        const currentMatchStage = {
            $match: {
                date: {
                    $gte: currentStartDate.toISOString().split("T")[0],
                    $lte: currentEndDate.toISOString().split("T")[0],
                },
            },
        };

        const previousMatchStage = {
            $match: {
                date: {
                    $gte: previousStartDate.toISOString().split("T")[0],
                    $lte: previousEndDate.toISOString().split("T")[0],
                },
            },
        };

        const aggregationGroupStage = {
            $group: {
                _id: "$issuer",
                totalVolume: { $sum: "$numericVolume" },
                totalMarketCap: { $sum: { $multiply: ["$numericPrice", "$numericVolume"] } }
            },
        };

        const aggregationAllGroupStage = {
            $group: {
                _id: null,
                totalMarketVolume: { $sum: "$numericVolume" },
                totalMarketCap: { $sum: { $multiply: ["$numericPrice", "$numericVolume"] } }
            },
        };

        const mostTradedPipeline = [
            currentMatchStage,
            ...commonPipeline,
            aggregationGroupStage,
            { $sort: { totalVolume: -1 } },
            { $limit: 1 },
        ];
        const currentMostTraded = await db.collection("stockData").aggregate(mostTradedPipeline).toArray();

        const marketPipelineCurrent = [
            currentMatchStage,
            ...commonPipeline,
            aggregationAllGroupStage,
        ];
        const currentMarketDataArr = await db.collection("stockData").aggregate(marketPipelineCurrent).toArray();
        const currentMarketData = currentMarketDataArr[0] || { totalMarketVolume: 0, totalMarketCap: 0 };

        const marketPipelinePrevious = [
            previousMatchStage,
            ...commonPipeline,
            aggregationAllGroupStage,
        ];
        const previousMarketDataArr = await db.collection("stockData").aggregate(marketPipelinePrevious).toArray();
        const previousMarketData = previousMarketDataArr[0] || { totalMarketVolume: 0, totalMarketCap: 0 };

        const previousVolume = previousMarketData.totalMarketVolume || 0;
        const currentVolume = currentMarketData.totalMarketVolume || 0;
        const previousCap = previousMarketData.totalMarketCap || 0;
        const currentCap = currentMarketData.totalMarketCap || 0;

        const volumePercentageChange = previousVolume === 0
            ? 0
            : ((currentVolume - previousVolume) / previousVolume) * 100;

        const capPercentageChange = previousCap === 0
            ? 0
            : ((currentCap - previousCap) / previousCap) * 100;

        const mostTradedStock = currentMostTraded[0] || null;

        res.json({
            mostTradedStock,
            marketStats: {
                marketVolume: currentVolume,
                marketCap: currentCap,
                volumePercentageChange,
                capPercentageChange,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching most traded stock and market stats" });
    }
});

router.get("/marketCapData", async (req, res) => {
    const { timeframe } = req.query;
    const db = req.db;

    if (!timeframe) {
        return res.status(400).json({ message: "Missing required parameters" });
    }

    try {
        const now = new Date();
        let currentStartDate, currentEndDate;

        if (timeframe === "This Year") {
            currentStartDate = new Date(now.getFullYear(), 0, 1);
            currentEndDate = now;
        } else if (timeframe === "This Month") {
            currentStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
            currentEndDate = now;
        } else if (timeframe === "This Week") {
            const dayOfWeek = now.getDay();
            const currentWeekStart = new Date(now);
            currentWeekStart.setDate(now.getDate() - dayOfWeek);
            currentStartDate = currentWeekStart;
            currentEndDate = now;
        } else {
            return res.status(400).json({ message: "Invalid timeframe" });
        }

        const marketCapDataPipeline = [
            {
                $match: {
                    date: {
                        $gte: currentStartDate.toISOString().split("T")[0],
                        $lte: currentEndDate.toISOString().split("T")[0],
                    },
                },
            },
            {
                $addFields: {
                    sanitizedPrice: {
                        $replaceAll: {
                            input: "$lastTradePrice",
                            find: ".",
                            replacement: "",
                        },
                    },
                },
            },
            {
                $addFields: {
                    sanitizedPrice: {
                        $replaceAll: {
                            input: "$sanitizedPrice",
                            find: ",",
                            replacement: ".",
                        },
                    },
                },
            },
            {
                $addFields: {
                    numericPrice: {
                        $convert: {
                            input: "$sanitizedPrice",
                            to: "double",
                            onError: null,
                            onNull: null,
                        },
                    },
                    numericVolume: {
                        $convert: {
                            input: "$volume",
                            to: "int",
                            onError: 0,
                            onNull: 0,
                        },
                    },
                },
            },
            {
                $addFields: {
                    capitalization: {
                        $multiply: ["$numericPrice", "$numericVolume"],
                    },
                },
            },
            {
                $group: {
                    _id: "$date",
                    totalCapitalization: { $sum: "$capitalization" },
                },
            },
            { $sort: { _id: 1 } },
        ];

        const marketCapData = await db.collection("stockData").aggregate(marketCapDataPipeline).toArray();

        const formattedData = marketCapData.map((item) => ({
            date: item._id,
            capitalization: item.totalCapitalization || 0,
        }));

        res.json({ currentData: formattedData });
    } catch (error) {
        console.error("Error fetching market capitalization data:", error);
        res.status(500).json({ message: "Error fetching market capitalization data" });
    }
});

router.get("/top-gainers", async (req, res) => {
    const { timeframe } = req.query;
    const db = req.db;

    if (!timeframe) {
        return res.status(400).json({ message: "Missing required parameters" });
    }

    try {
        const now = new Date();
        let currentStartDate, currentEndDate;
        let previousStartDate, previousEndDate;

        if (timeframe === "This Year") {
            currentStartDate = new Date(now.getFullYear(), 0, 1);
            currentEndDate = new Date();
            previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
            previousEndDate = new Date(now.getFullYear(), 0, 0);
        } else if (timeframe === "This Month") {
            currentStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
            currentEndDate = new Date();
            previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
        } else if (timeframe === "This Week") {
            const dayOfWeek = now.getDay();
            const currentWeekStart = new Date(now);
            currentWeekStart.setDate(now.getDate() - dayOfWeek);
            currentStartDate = currentWeekStart;
            currentEndDate = new Date();

            const previousWeekEnd = new Date(currentWeekStart);
            previousWeekEnd.setDate(previousWeekEnd.getDate() - 1);

            const previousWeekStart = new Date(previousWeekEnd);
            previousWeekStart.setDate(previousWeekStart.getDate() - 6);

            previousStartDate = previousWeekStart;
            previousEndDate = previousWeekEnd;
        } else {
            return res.status(400).json({ message: "Invalid timeframe" });
        }

        const commonPipeline = [
            {
                $addFields: {
                    priceWithoutThousands: {
                        $replaceAll: { input: "$lastTradePrice", find: ".", replacement: "" },
                    },
                },
            },
            {
                $addFields: {
                    priceFormatted: {
                        $replaceAll: { input: "$priceWithoutThousands", find: ",", replacement: "." },
                    },
                },
            },
            {
                $addFields: {
                    numericPrice: { $toDouble: "$priceFormatted" },
                },
            },
        ];

        const currentPipeline = [
            {
                $match: {
                    date: {
                        $gte: currentStartDate.toISOString().split("T")[0],
                        $lte: currentEndDate.toISOString().split("T")[0],
                    },
                },
            },
            ...commonPipeline,
            {
                $group: {
                    _id: "$issuer",
                    currentPrice: { $last: "$numericPrice" },
                },
            },
        ];

        const currentData = await db.collection("stockData").aggregate(currentPipeline).toArray();

        const previousPipeline = [
            {
                $match: {
                    date: {
                        $gte: previousStartDate.toISOString().split("T")[0],
                        $lte: previousEndDate.toISOString().split("T")[0],
                    },
                },
            },
            ...commonPipeline,
            {
                $group: {
                    _id: "$issuer",
                    previousPrice: { $last: "$numericPrice" },
                },
            },
        ];

        const previousData = await db.collection("stockData").aggregate(previousPipeline).toArray();

        const dailyDataPipeline = [
            {
                $match: {
                    date: {
                        $gte: currentStartDate.toISOString().split("T")[0],
                        $lte: currentEndDate.toISOString().split("T")[0],
                    },
                },
            },
            ...commonPipeline,
            {
                $group: {
                    _id: "$issuer",
                    dailyPrices: { $push: { date: "$date", price: "$numericPrice" } },
                },
            },
        ];

        const dailyData = await db.collection("stockData").aggregate(dailyDataPipeline).toArray();

        const gainers = currentData.map((cur) => {
            const prev = previousData.find((p) => p._id === cur._id);
            const daily = dailyData.find((d) => d._id === cur._id);

            const currentPrice = cur.currentPrice || 0;
            const previousPrice = prev?.previousPrice || 0;

            let percentageGain = 0;
            if (previousPrice !== 0) {
                percentageGain = ((currentPrice - previousPrice) / previousPrice) * 100;
            }

            return {
                _id: cur._id,
                currentPrice,
                previousPrice,
                percentageGain,
                dailyPrices: daily?.dailyPrices || [],
            };
        });

        const top18Gainers = gainers.sort((a, b) => b.percentageGain - a.percentageGain).slice(0, 18);

        res.json(top18Gainers);
    } catch (error) {
        console.error("Error fetching top gainers:", error);
        res.status(500).json({ message: "Error fetching top gainers" });
    }
});

router.get("/top-gainers-losers", async (req, res) => {
    const db = req.db;

    try {
        const distinctDates = await db.collection("stockData").distinct("date");
        if (!distinctDates.length) {
            return res.status(404).json({ message: "No data available" });
        }
        distinctDates.sort();
        const lastTwoDates = distinctDates.slice(-2);
        const [previousDate, latestDate] =
            lastTwoDates.length === 2
                ? lastTwoDates
                : [lastTwoDates[0], lastTwoDates[0]];

        const mainPipeline = [
            {
                $match: {
                    date: { $in: lastTwoDates },
                },
            },
            {
                $addFields: {
                    priceWithoutThousands: {
                        $replaceAll: {
                            input: "$lastTradePrice",
                            find: ".",
                            replacement: "",
                        },
                    },
                },
            },
            {
                $addFields: {
                    priceFormatted: {
                        $replaceAll: {
                            input: "$priceWithoutThousands",
                            find: ",",
                            replacement: ".",
                        },
                    },
                },
            },
            {
                $addFields: {
                    numericPrice: { $toDouble: "$priceFormatted" },
                },
            },
            {
                $group: {
                    _id: "$issuer",
                    prices: {
                        $push: {
                            date: "$date",
                            numericPrice: "$numericPrice",
                        },
                    },
                },
            },
        ];

        const rawResults = await db
            .collection("stockData")
            .aggregate(mainPipeline)
            .toArray();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dailyPipeline = [
            {
                $match: {
                    date: {
                        $gte: thirtyDaysAgo.toISOString().split("T")[0],
                    },
                },
            },
            {
                $addFields: {
                    priceWithoutThousands: {
                        $replaceAll: {
                            input: "$lastTradePrice",
                            find: ".",
                            replacement: "",
                        },
                    },
                },
            },
            {
                $addFields: {
                    priceFormatted: {
                        $replaceAll: {
                            input: "$priceWithoutThousands",
                            find: ",",
                            replacement: ".",
                        },
                    },
                },
            },
            {
                $addFields: {
                    numericPrice: { $toDouble: "$priceFormatted" },
                },
            },
            {
                $group: {
                    _id: "$issuer",
                    dailyPrices: {
                        $push: {
                            date: "$date",
                            price: "$numericPrice",
                        },
                    },
                },
            },
        ];

        const dailyResults = await db
            .collection("stockData")
            .aggregate(dailyPipeline)
            .toArray();

        const resultsWithChange = rawResults.map((item) => {
            let currentPrice = 0;
            let previousPrice = 0;

            item.prices.forEach((p) => {
                if (p.date === latestDate) {
                    currentPrice = p.numericPrice || 0;
                } else if (p.date === previousDate) {
                    previousPrice = p.numericPrice || 0;
                }
            });
            let percentageChange = 0;
            if (previousPrice !== 0) {
                percentageChange =
                    ((currentPrice - previousPrice) / previousPrice) * 100;
            }
            const foundDaily = dailyResults.find((d) => d._id === item._id);
            const dailyPrices = foundDaily?.dailyPrices || [];

            return {
                _id: item._id,
                currentPrice,
                previousPrice,
                percentageChange,
                dailyPrices,
            };
        });
        const positiveGainers = resultsWithChange.filter(
            (d) => d.percentageChange > 0
        );
        const zeroPercent = resultsWithChange.filter(
            (d) => d.percentageChange === 0
        );
        const losers = resultsWithChange.filter(
            (d) => d.percentageChange < 0
        );
        positiveGainers.sort(
            (a, b) => b.percentageChange - a.percentageChange
        );
        zeroPercent.sort((a, b) => b.currentPrice - a.currentPrice);
        losers.sort((a, b) => a.percentageChange - b.percentageChange);
        let topGainers = [...positiveGainers];
        if (topGainers.length < 6) {
            const needed = 6 - topGainers.length;
            topGainers = topGainers.concat(zeroPercent.slice(0, needed));
        }
        while (topGainers.length < 6) {
            topGainers.push({
                _id: "N/A",
                currentPrice: 0,
                previousPrice: 0,
                percentageChange: 0,
                dailyPrices: [],
            });
        }
        topGainers = topGainers.slice(0, 6);

        const topLosers = losers.slice(0, 6).map((loser) => {
            return {
                ...loser,
            };
        });

        return res.json({
            topGainers,
            topLosers,
        });
    } catch (error) {
        console.error("Error fetching top gainers and losers:", error);
        return res
            .status(500)
            .json({ message: "Error fetching top gainers and losers" });
    }
});


module.exports = router;