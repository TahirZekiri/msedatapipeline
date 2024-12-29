"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TbSquareRoundedChevronDownFilled } from "react-icons/tb";
import { MarketCapChart } from "@/components/marketCapChart";
import { SparklineChart } from "@/components/sparklineChart";

interface CurrentData {
    date: string;
    capitalization: number;
}

interface MarketStats {
    marketVolume: number;
    marketCap: number;
    volumePercentageChange: number;
    capPercentageChange: number;
}

interface MostTradedStock {
    _id: string;
    totalVolume: number;
}

interface Gainer {
    _id: string;
    percentageGain: number;
    dailyPrices: { price: number }[];
}

interface StockPerformance {
    _id: string;
    percentageChange: number;
    dailyPrices: { price: number }[];
}

interface ChartData {
    time: string;
    value: number;
}

function chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

export default function Home() {
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTimeframe, setSelectedTimeframe] = useState("This Year");
    const [mostTradedStock, setMostTradedStock] = useState<MostTradedStock | null>(null);
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [marketStats, setMarketStats] = useState<MarketStats>({
        marketVolume: 0,
        marketCap: 0,
        volumePercentageChange: 0,
        capPercentageChange: 0,
    });
    const [gainersChunks, setGainersChunks] = useState<Gainer[][]>([[], [], [], []]);
    const [carouselIndexes, setCarouselIndexes] = useState<number[]>(Array(9).fill(0));
    const [topGainersToday, setTopGainersToday] = useState<StockPerformance[]>([]);
    const [topLosersToday, setTopLosersToday] = useState<StockPerformance[]>([]);

    const fetchMarketData = async (timeframe: string) => {
        try {
            const response = await fetch(
                `http://localhost:5001/api/stockData/most-traded-stock?timeframe=${encodeURIComponent(
                    timeframe
                )}`
            );
            const data = await response.json();
            setMostTradedStock(data.mostTradedStock);
            setMarketStats(data.marketStats);
        } catch (error) {
            console.error("Error fetching market data:", error);
        }
    };
    const fetchTopGainers = useCallback(
        async (timeframe: string) => {
            try {
                const response = await fetch(
                    `http://localhost:5001/api/stockData/top-gainers?timeframe=${encodeURIComponent(
                        timeframe
                    )}`
                );
                const data: Gainer[] = await response.json();
                const chunked = chunkArray<Gainer>(data, 2);
                while (chunked.length < 9) {
                    chunked.push([]);
                }
                setGainersChunks(chunked.slice(0, 9));
                setIsLoading(false);
                setCarouselIndexes(Array(9).fill(0));
            } catch (error) {
                console.error("Error fetching top gainers:", error);
            }
        },
        []
    );

    const fetchMarketCapitalizationData = async (timeframe: string) => {
        try {
            const response = await fetch(
                `http://localhost:5001/api/stockData/marketCapData?timeframe=${encodeURIComponent(
                    timeframe
                )}`
            );
            const data = await response.json();
            const formattedData: ChartData[] = data.currentData.map((item: CurrentData) => ({
                time: item.date,
                value: item.capitalization,
            }));
            setChartData(formattedData);
        } catch (error) {
            console.error("Error fetching market capitalization data:", error);
        }
    };

    useEffect(() => {
        fetchMarketData(selectedTimeframe);
        fetchTopGainers(selectedTimeframe);
        fetchMarketCapitalizationData(selectedTimeframe);
    }, [selectedTimeframe, fetchTopGainers]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("http://localhost:5001/api/stockData/top-gainers-losers");
                const data = await response.json();
                setTopGainersToday(data.topGainers);
                setTopLosersToday(data.topLosers);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching top gainers and losers:", error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCarouselIndexes((prevIndexes) =>
                prevIndexes.map((index, chunkIdx) => {
                    const items = gainersChunks[chunkIdx];
                    if (!items.length) return 0;
                    return (index + 1) % items.length;
                })
            );
        }, 3000);

        return () => clearInterval(interval);
    }, [gainersChunks]);

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {/* Market Volume */}
                <div className="flex flex-col">
                    <span className="text-gray-500 text-sm font-medium">Market Volume</span>
                    <div className="flex items-center bg-black text-white px-4 py-2 rounded-md text-base font-bold h-10 relative">
            <span className="truncate">
              {marketStats.marketVolume.toLocaleString("en-US")} MKD
            </span>
                        <div
                            className={`absolute right-1 top-1 px-1 py-2 text-xs font-semibold rounded-md ${
                                marketStats.volumePercentageChange >= 0
                                    ? "bg-customGreen text-green-800"
                                    : "bg-red-100 text-red-700"
                            }`}
                        >
                            {marketStats.volumePercentageChange >= 0 ? "+" : ""}
                            {marketStats.volumePercentageChange.toFixed(2)}%
                        </div>
                    </div>
                </div>

                {/* Market Capitalization */}
                <div className="flex flex-col">
                    <span className="text-gray-500 text-sm font-medium">Market Capitalization</span>
                    <div className="flex items-center bg-black text-white px-4 py-2 rounded-md text-base font-bold h-10 relative">
            <span className="truncate">
              {marketStats.marketCap.toLocaleString("en-US")} MKD
            </span>
                        <div
                            className={`absolute right-1 top-1 px-1 py-2 text-xs font-semibold rounded-md ${
                                marketStats.capPercentageChange >= 0
                                    ? "bg-customGreen text-green-800"
                                    : "bg-red-100 text-red-700"
                            }`}
                        >
                            {marketStats.capPercentageChange >= 0 ? "+" : ""}
                            {marketStats.capPercentageChange.toFixed(2)}%
                        </div>
                    </div>
                </div>

                {/* Most Traded Stock */}
                <div className="flex flex-col">
                    <span className="text-gray-500 text-sm font-medium">Most Traded Stock</span>
                    <div className="flex items-center bg-black text-white px-4 py-2 rounded-md text-base font-bold h-10">
                        {mostTradedStock ? (
                            <>
                                <span className="truncate">{mostTradedStock._id}</span>
                                <div className="ml-auto font-bold">
                                    {mostTradedStock.totalVolume.toLocaleString("en-US")}
                                </div>
                                <div className="text-customGreen font-bold whitespace-nowrap">▲</div>
                            </>
                        ) : (
                            <span>Loading...</span>
                        )}
                    </div>
                </div>

                {/* Timeframe Dropdown */}
                <div className="flex flex-col">
                    <span className="text-gray-500 text-sm font-medium">Timeframe</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="flex items-center justify-between px-4 py-2 rounded-md h-10 w-full text-base"
                            >
                                {selectedTimeframe}
                                <TbSquareRoundedChevronDownFilled className="ml-2 h-4 w-4 text-gray-700" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onSelect={() => setSelectedTimeframe("This Year")}>
                                This Year
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setSelectedTimeframe("This Month")}>
                                This Month
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setSelectedTimeframe("This Week")}>
                                This Week
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="grid grid-cols-10 gap-4 mt-4">
                <div className="grid grid-cols-3 col-span-4 gap-4">
                    {isLoading
                        ? Array.from({ length: 9 }).map((_, idx) => (
                            <Card
                                key={idx}
                                className="rounded-xl shadow-sm border border-gray-200 flex flex-col p-4 animate-pulse"
                            >
                                <div className="w-full h-6 bg-gray-300 mb-4 rounded" />
                                <div className="w-1/2 h-8 bg-gray-300 mb-4 rounded" />
                                <div className="mt-auto">
                                    <SparklineChart data={[]} isLoading width={120} height={30} />
                                </div>
                            </Card>
                        ))
                        : gainersChunks.map((chunk, chunkIndex) => {
                            const currentIndex = carouselIndexes[chunkIndex];
                            const item = chunk[currentIndex];

                            return (
                                <Card
                                    key={chunkIndex}
                                    className="rounded-xl shadow-sm border border-gray-200 flex flex-col p-4"
                                >
                                    <div className="flex flex-col items-start mb-2">
                      <span className="text-gray-400 text-sm font-medium">
                        {item?._id ?? "N/A"}
                      </span>
                                        <span className="text-3xl font-semibold text-black mt-1">
                        {item?.percentageGain != null
                            ? `${Math.round(item.percentageGain)}%`
                            : "N/A"}
                      </span>
                                    </div>
                                    <div className="mt-auto">
                                        <SparklineChart
                                            data={item?.dailyPrices?.map((p) => p.price) || []}
                                            color="blue"
                                            width={120}
                                            height={30}
                                        />
                                    </div>
                                </Card>
                            );
                        })}
                </div>

                {/* Right side: 6 col with the Market Capitalization Chart */}
                <div className="col-span-6">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Market Capitalization Chart</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MarketCapChart data={chartData} isLoading={isLoading} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Top Losers and Gainers Section */}
            <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* Left Side: Top Losers */}
                <Card className="shadow-sm border">
                    <CardHeader className="pb-2">
                        <CardTitle>Top Losers Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="rounded-xl shadow-sm border border-gray-200 flex flex-col p-4 animate-pulse"></div>
                        ) : topLosersToday.length === 0 ? (
                            <div className="text-gray-500 text-center font-medium">
                                There are no losers today.
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-4">
                                {topLosersToday.slice(0, 6).map((loser, index) => (
                                    <Card
                                        key={index}
                                        className="p-4 flex flex-col justify-between border shadow-sm"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-500">{loser._id}</span>
                                            <span className="text-xl font-bold">
                        {loser.percentageChange.toFixed(2)}%
                      </span>
                                        </div>
                                        {/* Sparkline for each loser */}
                                        <div className="mt-2">
                                            <SparklineChart
                                                data={loser?.dailyPrices?.map((p) => p.price) || []}
                                                color="red"
                                                width={100}
                                                height={30}
                                            />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right Side: Top Gainers */}
                <Card className="shadow-sm border">
                    <CardHeader className="pb-2">
                        <CardTitle>Top Gainers Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="animate-pulse">Loading...</div>
                        ) : (
                            <div className="grid grid-cols-3 gap-4">
                                {topGainersToday.slice(0, 6).map((gainer, index) => (
                                    <Card
                                        key={index}
                                        className="p-4 flex flex-col justify-between border shadow-sm"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-500">{gainer._id}</span>
                                            <span className="text-xl font-bold">
                        {gainer.percentageChange.toFixed(2)}%
                      </span>
                                        </div>
                                        {/* Sparkline for each gainer */}
                                        <div className="mt-2">
                                            <SparklineChart
                                                data={gainer?.dailyPrices?.map((p) => p.price) || []}
                                                color="green"
                                                width={100}
                                                height={30}
                                            />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}