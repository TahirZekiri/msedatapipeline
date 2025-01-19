"use client";

import React, { useEffect, useRef } from "react";
import {
    createChart,
    ColorType,
    CrosshairMode,
    IChartApi,
    ISeriesApi,
    UTCTimestamp,
} from "lightweight-charts";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { TbSquareRoundedChevronDownFilled } from "react-icons/tb";
import { Candle } from "@/types/types";

interface Signal {
    time: UTCTimestamp;
    type: "Buy" | "Sell" | "Hold";
    price: number;
}

interface IndicatorData {
    date: string;
    value: number;
    signal: "Buy" | "Sell" | "Hold";
}

interface TechnicalAnalysisChartProps {
    chartData: Candle[];
    indicatorData: IndicatorData[];

    issuers: string[];
    selectedIssuer: string;
    onSelectIssuer: (issuer: string) => void;

    indicators: string[];
    selectedIndicator: string;
    onSelectIndicator: (indicator: string) => void;

    periods: string[];
    selectedPeriod: string;
    onSelectPeriod: (period: string) => void;
}

export default function TechnicalAnalysisChart({
                                                   chartData,
                                                   indicatorData,
                                                   indicators,
                                                   selectedIndicator,
                                                   onSelectIndicator,
                                                   periods,
                                                   selectedPeriod,
                                                   onSelectPeriod,
                                               }: TechnicalAnalysisChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartApiRef = useRef<IChartApi | null>(null);
    const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const signals: Signal[] = indicatorData.map((d) => ({
        time: Math.floor(new Date(d.date).getTime() / 1000) as UTCTimestamp,
        type: d.signal,
        price: d.value,
    }));

    useEffect(() => {
        if (!chartContainerRef.current) return;
        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 450,
            layout: {
                background: { color: "#ffffff", type: ColorType.Solid },
                textColor: "#6b6b6b",
            },
            grid: {
                vertLines: { color: "#e0e0e0" },
                horzLines: { color: "#e0e0e0" },
            },
            crosshair: { mode: CrosshairMode.Normal },
            rightPriceScale: {
                borderColor: "#d1d4dc",
            },
            timeScale: {
                borderColor: "#d1d4dc",
                fixLeftEdge: true,
                fixRightEdge: true,
            },
        });

        chartApiRef.current = chart;
        const candlestickSeries = chart.addCandlestickSeries({
            upColor: "#4caf50",
            downColor: "#f44336",
            borderDownColor: "#f44336",
            borderUpColor: "#4caf50",
            wickDownColor: "#f44336",
            wickUpColor: "#4caf50",
        });
        candlestickSeriesRef.current = candlestickSeries;
        if (chartData.length > 0) {
            candlestickSeries.setData(
                chartData.map((c) => ({
                    time: c.time,
                    open: c.open,
                    high: c.high,
                    low: c.low,
                    close: c.close,
                }))
            );
            const first = chartData[0].time;
            const last = chartData[chartData.length - 1].time;
            chart.timeScale().setVisibleRange({ from: first, to: last });
        }

        candlestickSeries.setMarkers(
            signals.map((signal) => ({
                time: signal.time,
                position: signal.type === "Buy" ? "belowBar" : "aboveBar",
                color: signal.type === "Buy" ? "#4caf50" : signal.type === "Sell" ? "#f44336" : "#ffeb3b",
                shape: signal.type === "Buy" ? "arrowUp" : signal.type === "Sell" ? "arrowDown" : "circle",
                text: `${signal.type} @ ${signal.price.toFixed(2)}`,
            }))
        );

        const handleResize = () => {
            if (!chartContainerRef.current) return;
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            chart.remove();
        };
    }, [chartData, signals]);

    const latestIndicator = indicatorData[indicatorData.length - 1] ?? null;
    const secondLastIndicator = indicatorData.length > 1 ? indicatorData[indicatorData.length - 2] : null;
    let directionArrow = "";
    if (latestIndicator && secondLastIndicator) {
        directionArrow = latestIndicator.value >= secondLastIndicator.value ? " ▲" : " ▼";
    }
    const suggestionText = latestIndicator
        ? `${latestIndicator.signal} stocks. (Last signal on ${latestIndicator.date})`
        : `No suggestions available for the selected timeframe (${selectedPeriod}).`;

    const isGreen = latestIndicator && secondLastIndicator
        ? latestIndicator.value >= secondLastIndicator.value
        : false;

    return (
        <div className="flex flex-col md:flex-row md:gap-6">
            {/* Right-side panel */}
            <div className="order-1 md:order-2 w-full md:w-1/3 mb-4 md:mb-0 space-y-4 border rounded-lg p-4">
                {/* Title */}
                <h2 className="text-xl font-bold text-gray-800">Technical Analysis</h2>

                {/* Indicator Dropdown */}
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Indicator:</p>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                                {selectedIndicator}
                                <TbSquareRoundedChevronDownFilled className="ml-2 h-4 w-4 text-gray-700" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {indicators.map((indicator) => (
                                <DropdownMenuItem
                                    key={indicator}
                                    onSelect={() => onSelectIndicator(indicator)}
                                >
                                    {indicator}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Timeframe Dropdown */}
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Timeframe:</p>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                                {selectedPeriod}
                                <TbSquareRoundedChevronDownFilled className="ml-2 h-4 w-4 text-gray-700" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {periods.map((period) => (
                                <DropdownMenuItem
                                    key={period}
                                    onSelect={() => onSelectPeriod(period)}
                                >
                                    {period}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Current Indicator Value */}
                <div className="border-t pt-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Current Indicator Value</p>
                    <div className="flex justify-between items-center border border-gray-400 rounded-lg p-2">
                        <span className="font-bold text-gray-800">{selectedIndicator}</span>
                        <span className={`font-bold ${isGreen ? "text-green-600" : "text-red-600"}`}>
                            {latestIndicator ? latestIndicator.value.toFixed(2) + directionArrow : "/"}
                        </span>
                    </div>
                </div>

                {/* Suggestion Section */}
                <div className="border-t pt-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Suggestion</p>
                    <p className="font-bold text-gray-800">{suggestionText}</p>
                </div>
            </div>

            {/* Chart Container */}
            <div className="order-2 md:order-1 w-full md:w-2/3 bg-white shadow-md rounded-lg p-4" style={{ height: "465px" }}>
                {chartData.length === 0 ? (
                    <div className="flex justify-center items-center h-full animate-pulse bg-gray-200 rounded"></div>
                ) : (
                    <div ref={chartContainerRef} className="w-full h-full"></div>
                )}
            </div>
        </div>
    );
}