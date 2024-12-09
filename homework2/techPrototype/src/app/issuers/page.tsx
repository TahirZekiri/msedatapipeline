// src/app/issuers/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { TradingDataChart } from "@/components/tradingDataChart";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { TbSquareRoundedChevronDownFilled } from "react-icons/tb";

interface StockData {
    date: string;
    issuer: string;
    lastTradePrice: string | null;
    max: string | null;
    min: string | null;
    turnoverBest: string;
    volume: number;
    // Assume you add these fields or derive them:
    open?: number;
    high?: number;
    low?: number;
    close?: number;
}

interface Metrics {
    volume: {
        value: number;
        change: number;
    };
    turnover: {
        value: number;
        change: number;
    };
}

function parseTurnover(value: string): number {
    const noDots = value.replace(/\./g, "");
    const normalized = noDots.replace(",", ".");
    return parseFloat(normalized);
}

export default function IssuersPage() {
    const [issuers, setIssuers] = useState<string[]>([]);
    const [selectedIssuer, setSelectedIssuer] = useState<string>("KMB");
    const [selectedTimeframe, setSelectedTimeframe] = useState<string>("This Year");
    const [tableData, setTableData] = useState<StockData[]>([]);
    const [metrics, setMetrics] = useState<Metrics>({
        volume: { value: 0, change: 0 },
        turnover: { value: 0, change: 0 },
    });

    // New data structure formatted for the chart
    const [chartData, setChartData] = useState<
        { date: string; open: number; high: number; low: number; close: number; volume: number }[]
    >([]);

    useEffect(() => {
        fetch("http://localhost:5001/api/issuers")
            .then((res) => res.json())
            .then((data: string[]) => setIssuers(data))
            .catch((err) => console.error(err));
    }, []);

    useEffect(() => {
        fetch(`http://localhost:5001/api/stockData?issuer=${selectedIssuer}&timeframe=${selectedTimeframe}`)
            .then((res) => res.json())
            .then(({ currentData, previousData }: { currentData: StockData[], previousData: StockData[] }) => {
                // Sort currentData by date ascending
                const safeParsePrice = (price: string | null) => {
                    const p = price ?? "0";
                    return parseFloat(p.replace(",", "."));
                };

                const sortedCurrentData = [...currentData].sort((a, b) => {
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                });

// Remove duplicate times if any
                const uniqueData = sortedCurrentData.filter((item, index, arr) => {
                    return index === 0 || new Date(item.date).getTime() !== new Date(arr[index-1].date).getTime();
                });

// Log to ensure uniqueness
                console.log("Unique Chart Data:", uniqueData);

                setTableData([...uniqueData].reverse());

                const candlestickData = uniqueData
                    .map((d) => {
                        const dateObj = new Date(d.date);
                        if (isNaN(dateObj.getTime())) {
                            console.error("Invalid date:", d.date);
                            return null;
                        }
                        const y = dateObj.getUTCFullYear();
                        const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
                        const day = String(dateObj.getUTCDate()).padStart(2, '0');
                        const timeString = `${y}-${m}-${day}`; // YYYY-MM-DD

                        return {
                            time: timeString,
                            open: safeParsePrice(d.lastTradePrice),
                            high: safeParsePrice(d.max),
                            low: safeParsePrice(d.min),
                            close: safeParsePrice(d.lastTradePrice),
                            volume: d.volume,
                        };
                    })
                    .filter(Boolean);

                setChartData(candlestickData);

                // Metrics calculations can be done on sortedCurrentData (order doesn't matter for aggregate calculations)
                const totalCurrentVolume = sortedCurrentData.reduce((acc, record) => acc + record.volume, 0);
                const totalPreviousVolume = previousData.reduce((acc, record) => acc + record.volume, 0);

                const volumeChange =
                    (previousData.length > 0 && totalPreviousVolume !== 0)
                        ? ((totalCurrentVolume - totalPreviousVolume) / totalPreviousVolume) * 100
                        : 0;

                const totalCurrentTurnover = sortedCurrentData.reduce((acc, record) => acc + parseTurnover(record.turnoverBest), 0);
                const totalPreviousTurnover = previousData.reduce((acc, record) => acc + parseTurnover(record.turnoverBest), 0);

                const turnoverChange =
                    (previousData.length > 0 && totalPreviousTurnover !== 0)
                        ? ((totalCurrentTurnover - totalPreviousTurnover) / totalPreviousTurnover) * 100
                        : 0;

                setMetrics({
                    volume: {
                        value: totalCurrentVolume,
                        change: volumeChange,
                    },
                    turnover: {
                        value: totalCurrentTurnover,
                        change: turnoverChange,
                    },
                });
            })
            .catch(console.error);
    }, [selectedIssuer, selectedTimeframe]);

    return (
        <div>
            {/* Metrics and Dropdown Section */}
            <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-4 gap-6 mb-8 items-start">
                {/* Market Volume */}
                <div className="flex flex-col items-start space-y-2">
                    <span className="text-gray-500 text-sm font-medium">Market volume</span>
                    <div
                        className="flex items-center justify-between bg-black text-white px-4 py-3 rounded-lg text-lg font-bold relative w-full h-9 max-w-sm">
                        <span className="truncate max-w-[70%]">{metrics.volume.value.toLocaleString("mk-MK")}</span>
                        <div
                            className={`absolute right-1 top-1 px-1 py-1 rounded-md text-sm font-semibold ${
                                metrics.volume.change >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                        >
                            {metrics.volume.change >= 0 ? "+" : ""}
                            {metrics.volume.change.toFixed(2)}%
                        </div>
                    </div>
                </div>

                {/* Market Turnover */}
                <div className="flex flex-col items-start space-y-2">
                    <span className="text-gray-500 text-sm font-medium">Market Turnover</span>
                    <div className="flex items-center justify-between bg-black text-white px-4 py-3 rounded-lg text-lg font-bold relative w-full h-9 max-w-sm">
                        <span className="truncate max-w-[70%]">
                            {metrics.turnover.value.toLocaleString("mk-MK", { style: "currency", currency: "MKD" })}
                        </span>
                        <div
                            className={`absolute right-1 top-1 px-1 py-1 rounded-md text-sm font-semibold ${
                                metrics.turnover.change >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                        >
                            {metrics.turnover.change >= 0 ? "+" : ""}
                            {metrics.turnover.change.toFixed(2)}%
                        </div>
                    </div>
                </div>

                {/* Issuer Dropdown */}
                <div className="flex flex-col items-start space-y-2 w-full">
                    <DropdownMenu>
                        <span className="text-gray-500 text-sm font-medium">Issuer</span>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full max-w-sm justify-between flex items-center">
                                {selectedIssuer}
                                <TbSquareRoundedChevronDownFilled
                                    className="ml-2 h-4 w-4 text-gray-700"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="max-h-48 overflow-y-auto w-full max-w-sm"
                            align="start"
                        >
                            {issuers.map((issuer) => (
                                <DropdownMenuItem
                                    key={issuer}
                                    onSelect={() => setSelectedIssuer(issuer)}
                                >
                                    {issuer}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Timeframe Dropdown */}
                <div className="flex flex-col items-start md:items-start space-y-2 w-full">
                    <DropdownMenu>
                        <span className="text-gray-500 text-sm font-medium">Timeframe</span>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full md:w-full max-w-sm justify-between">
                                {selectedTimeframe}
                                <TbSquareRoundedChevronDownFilled
                                    className="ml-2 h-4 w-4 text-gray-700"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="start"
                        >
                            <DropdownMenuItem onSelect={() => setSelectedTimeframe("This Year")}>This
                                Year</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setSelectedTimeframe("This Month")}>This
                                Month</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setSelectedTimeframe("This Week")}>This
                                Week</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Table and Graph Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Table */}
                <div
                    className="overflow-x-auto overflow-y-auto bg-white shadow-md rounded-lg"
                    style={{maxHeight: "465px"}}
                >
                    <table className="relative w-full text-sm">
                        {/* Table Header */}
                        <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
                        <tr>
                            <th className="px-4 py-2 whitespace-nowrap border-b border-gray-200">Date</th>
                            <th className="px-4 py-2 whitespace-nowrap border-b border-gray-200">Last Trade Price</th>
                            <th className="px-4 py-2 whitespace-nowrap border-b border-gray-200">Min</th>
                            <th className="px-4 py-2 whitespace-nowrap border-b border-gray-200">Max</th>
                            <th className="px-4 py-2 whitespace-nowrap border-b border-gray-200">Turnover BEST</th>
                            <th className="px-4 py-2 whitespace-nowrap border-b border-gray-200">Volume</th>
                        </tr>
                        </thead>
                        {/* Table Body */}
                        <tbody>
                        {tableData.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border border-gray-200">
                                    {new Date(row.date).toLocaleDateString("en-GB")}
                                </td>
                                <td className="px-4 py-2 border border-gray-200">{row.lastTradePrice || "-"}</td>
                                <td className="px-4 py-2 border border-gray-200">{row.min || "-"}</td>
                                <td className="px-4 py-2 border border-gray-200">{row.max || "-"}</td>
                                <td className="px-4 py-2 border border-gray-200">{row.turnoverBest}</td>
                                <td className="px-4 py-2 border border-gray-200">{row.volume}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* New TradingView-Like Graph */}
                <div className="p-1 bg-white shadow-md rounded-lg"
                     style={{height: "465px"}}
                >
                    <h2 className="text-xl font-semibold mb-4">Price Chart</h2>
                    <TradingDataChart data={chartData}/>
                </div>
            </div>
        </div>
    );
}
