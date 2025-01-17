"use client";

import React, { useState, useEffect } from "react";
import { TbSquareRoundedChevronDownFilled } from "react-icons/tb";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UTCTimestamp } from "lightweight-charts";
import { Candle} from "@/types/types";
import { TradingDataChart } from "@/components/tradingDataChart";
import TechnicalAnalysisChart from "@/components/technicalAnalysisChart";
interface StockData {
    date: string;
    issuer: string;
    lastTradePrice: string | null;
    max: string | null;
    min: string | null;
    turnoverBest: string;
    volume: number;
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
interface IndicatorData {
    date: string;
    value: number;
    signal: "Buy" | "Sell" | "Hold";
}
function dateStringToTimestamp(dateStr: string): UTCTimestamp {
    return Math.floor(new Date(dateStr).getTime() / 1000) as UTCTimestamp;
}

function parseTurnover(value: string): number {
    const noDots = value.replace(/\./g, "");
    const normalized = noDots.replace(",", ".");
    return parseFloat(normalized);
}

export default function IssuersPage() {
    const [issuers, setIssuers] = useState<string[]>([]);
    const [selectedIssuer, setSelectedIssuer] = useState("KMB");
    const [selectedTimeframe, setSelectedTimeframe] = useState("This Year");

    const [tableData, setTableData] = useState<StockData[]>([]);
    const [metrics, setMetrics] = useState<Metrics>({
        volume: { value: 0, change: 0 },
        turnover: { value: 0, change: 0 },
    });

    const [chartData, setChartData] = useState<Candle[]>([]);
    const [indicatorData, setIndicatorData] = useState<IndicatorData[]>([]);
    const [selectedIndicator, setSelectedIndicator] = useState("SMA");
    const [selectedIndicatorPeriod, setSelectedIndicatorPeriod] = useState("1 Month");
    useEffect(() => {
        fetch("http://localhost:5001/api/issuers")
            .then((res) => res.json())
            .then((data: string[]) => setIssuers(data))
            .catch((err) => console.error(err));
    }, []);
    useEffect(() => {
        fetch(
            `http://localhost:5001/api/stockData?issuer=${selectedIssuer}&timeframe=${selectedTimeframe}`
        )
            .then((res) => res.json())
            .then(
                ({
                     currentData,
                     previousData,
                 }: {
                    currentData: StockData[];
                    previousData: StockData[];
                }) => {
                    const sortedCurrentData = [...currentData].sort(
                        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                    );

                    const uniqueData = sortedCurrentData.filter(
                        (item, index, arr) =>
                            index === 0 || item.date !== arr[index - 1].date
                    );

                    setTableData([...uniqueData].reverse());

                    const candleData: Candle[] = uniqueData.map((d) => ({
                        time: dateStringToTimestamp(d.date),
                        open: parseFloat(d.lastTradePrice ?? "0"),
                        high: parseFloat(d.max ?? "0"),
                        low: parseFloat(d.min ?? "0"),
                        close: parseFloat(d.lastTradePrice ?? "0"),
                        volume: d.volume,
                    }));
                    setChartData(candleData);

                    const totalCurrentVolume = sortedCurrentData.reduce(
                        (sum, record) => sum + record.volume,
                        0
                    );
                    const totalPreviousVolume = previousData.reduce(
                        (sum, record) => sum + record.volume,
                        0
                    );
                    const volumeChange = totalPreviousVolume
                        ? ((totalCurrentVolume - totalPreviousVolume) / totalPreviousVolume) * 100
                        : 0;

                    const totalCurrentTurnover = sortedCurrentData.reduce(
                        (sum, record) => sum + parseTurnover(record.turnoverBest),
                        0
                    );
                    const totalPreviousTurnover = previousData.reduce(
                        (sum, record) => sum + parseTurnover(record.turnoverBest),
                        0
                    );
                    const turnoverChange = totalPreviousTurnover
                        ? ((totalCurrentTurnover - totalPreviousTurnover) / totalPreviousTurnover) * 100
                        : 0;

                    setMetrics({
                        volume: { value: totalCurrentVolume, change: volumeChange },
                        turnover: { value: totalCurrentTurnover, change: turnoverChange },
                    });
                }
            )
            .catch(console.error);
    }, [selectedIssuer, selectedTimeframe]);
    useEffect(() => {
        fetch(
            `http://localhost:5001/api/technicalAnalysis?issuer=${selectedIssuer}&indicator=${selectedIndicator}&period=${selectedIndicatorPeriod}`
        )
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then((data: IndicatorData[]) => {
                if (data && data.length > 0) {
                    setIndicatorData(data);
                } else {
                    console.warn("No indicator data available for the selected parameters.");
                    setIndicatorData([]); // Reset the indicator data if no data is returned(this will handle errors better)
                }
            })
            .catch((err) => {
                console.error("Failed to fetch indicator data:", err);
                setIndicatorData([]); // Reset to an empty array on error(this will handle errors better)
            });
    }, [selectedIssuer, selectedIndicator, selectedIndicatorPeriod]);
    return (
        <div>
            <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-4 gap-6 mb-8 items-start">
                {/* Market Volume */}
                <div className="flex flex-col items-start space-y-2">
                    <span className="text-gray-500 text-sm font-medium">Market volume</span>
                    <div
                        className="flex items-center justify-between bg-black text-white px-4 py-3 rounded-lg text-lg font-bold relative w-full h-9 max-w-sm"
                    >
            <span className="truncate max-w-[70%]">
              {metrics.volume.value.toLocaleString("mk-MK")}
            </span>
                        <div
                            className={`absolute right-1 top-1 px-1 py-1 rounded-md text-sm font-semibold ${
                                metrics.volume.change >= 0
                                    ? "bg-customGreen text-green-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                        >
                            {metrics.volume.change >= 0 ? "+" : ""}
                            {metrics.volume.change.toFixed(2)}%
                        </div>
                    </div>
                </div>

                {/* Market Turnover */}
                <div className="flex flex-col items-start space-y-2">
          <span className="text-gray-500 text-sm font-medium">
            Market Turnover
          </span>
                    <div
                        className="flex items-center justify-between bg-black text-white px-4 py-3 rounded-lg text-lg font-bold relative w-full h-9 max-w-sm"
                    >
            <span className="truncate max-w-[70%]">
              {metrics.turnover.value.toLocaleString("mk-MK", {
                  style: "currency",
                  currency: "MKD",
              })}
            </span>
                        <div
                            className={`absolute right-1 top-1 px-1 py-1 rounded-md text-sm font-semibold ${
                                metrics.turnover.change >= 0
                                    ? "bg-customGreen text-green-700"
                                    : "bg-red-100 text-red-700"
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
                            <Button
                                variant="outline"
                                className="w-full max-w-sm justify-between flex items-center"
                            >
                                {selectedIssuer}
                                <TbSquareRoundedChevronDownFilled className="ml-2 h-4 w-4 text-gray-700" />
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
            <span className="text-gray-500 text-sm font-medium">
              Timeframe
            </span>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full md:w-full max-w-sm justify-between"
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

            {/* Table and Graph Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* TABLE */}
                <div
                    className="overflow-x-auto overflow-y-auto bg-white shadow-md rounded-lg"
                    style={{ maxHeight: "465px" }}
                >
                    <table className="relative w-full text-sm">
                        <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
                        <tr>
                            <th className="px-4 py-2 whitespace-nowrap border-b border-gray-200">
                                Date
                            </th>
                            <th className="px-4 py-2 whitespace-nowrap border-b border-gray-200">
                                Last Trade Price
                            </th>
                            <th className="px-4 py-2 whitespace-nowrap border-b border-gray-200">
                                Min
                            </th>
                            <th className="px-4 py-2 whitespace-nowrap border-b border-gray-200">
                                Max
                            </th>
                            <th className="px-4 py-2 whitespace-nowrap border-b border-gray-200">
                                Turnover BEST
                            </th>
                            <th className="px-4 py-2 whitespace-nowrap border-b border-gray-200">
                                Volume
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {tableData.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border border-gray-200">
                                    {new Date(row.date).toLocaleDateString("en-GB")}
                                </td>
                                <td className="px-4 py-2 border border-gray-200">
                                    {row.lastTradePrice || "-"}
                                </td>
                                <td className="px-4 py-2 border border-gray-200">
                                    {row.min || "-"}
                                </td>
                                <td className="px-4 py-2 border border-gray-200">
                                    {row.max || "-"}
                                </td>
                                <td className="px-4 py-2 border border-gray-200">
                                    {row.turnoverBest}
                                </td>
                                <td className="px-4 py-2 border border-gray-200">
                                    {row.volume}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* CANDLESTICK CHART */}
                <div className="p-1 bg-white shadow-md rounded-lg" style={{ height: "465px" }}>
                    <h2 className="text-xl font-semibold mb-4">Price Chart</h2>
                    <TradingDataChart data={chartData} />
                </div>
            </div>

            {/* Technical Analysis Chart (with signals, side panel, etc.) */}
            <div className="mt-8">
                <div
                    className="p-1 border border-gray-400 rounded-lg"
                    style={{ height: "480px" }}
                >
                    <TechnicalAnalysisChart
                        chartData={chartData}
                        indicatorData={indicatorData}
                        issuers={issuers}
                        selectedIssuer={selectedIssuer}
                        onSelectIssuer={(issuer) => setSelectedIssuer(issuer)}
                        indicators={[
                            "SMA",
                            "EMA",
                            "WMA",
                            "HMA",
                            "VWMA",
                            "RSI",
                            "MACD",
                            "Stochastic",
                            "CCI",
                            "ADX",
                        ]}
                        selectedIndicator={selectedIndicator}
                        onSelectIndicator={(indicator) => setSelectedIndicator(indicator)}
                        periods={["1 Day", "1 Week", "1 Month"]}
                        selectedPeriod={selectedIndicatorPeriod}
                        onSelectPeriod={(period) => setSelectedIndicatorPeriod(period)}
                    />
                </div>
            </div>
        </div>
    );
}