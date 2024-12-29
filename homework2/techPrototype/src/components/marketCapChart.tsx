"use client";

import React, { useEffect, useRef } from "react";
import {
    createChart,
    IChartApi,
    ISeriesApi,
    LineData,
    BusinessDay,
    DeepPartial,
    ChartOptions,
    ColorType,
    Time,
} from "lightweight-charts";

interface MarketCapPoint {
    time: BusinessDay | string; // Use BusinessDay or ISO string
    value: number;
}

interface MarketCapChartProps {
    data: MarketCapPoint[];
    isLoading?: boolean;
}

export const MarketCapChart: React.FC<MarketCapChartProps> = ({ data, isLoading = false }) => {
    const chartContainerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

    useEffect(() => {
        if (isLoading || !chartContainerRef.current) return;

        const chartOptions: DeepPartial<ChartOptions> = {
            width: chartContainerRef.current.clientWidth,
            height: 400,
            layout: {
                background: { type: ColorType.Solid, color: "#ffffff" }, // Fixed: Use ColorType.Solid
                textColor: "#222",
                fontSize: 12,
            },
            grid: {
                vertLines: { color: "#f0f0f0" },
                horzLines: { color: "#f0f0f0" },
            },
            rightPriceScale: {
                borderVisible: false,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1,
                },
            },
            timeScale: {
                borderVisible: false,
                timeVisible: true,
                secondsVisible: false,
                fixLeftEdge: true,
                fixRightEdge: true,
            },
            handleScroll: {
                vertTouchDrag: false,
                mouseWheel: true,
                pressedMouseMove: true,
            },
            handleScale: {
                axisPressedMouseMove: true,
                pinch: true,
                mouseWheel: true,
            },
        };

        const chart = createChart(chartContainerRef.current, chartOptions);
        chartRef.current = chart;

        const lineSeries = chart.addLineSeries({
            color: "#1B59F8",
            lineWidth: 2,
        });
        lineSeriesRef.current = lineSeries;

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            chart.remove();
        };
    }, [isLoading]);

    useEffect(() => {
        if (!lineSeriesRef.current || !chartRef.current || isLoading) return;

        const processedData: LineData[] = data.map((point) => {
            let time: Time;
            if (typeof point.time === "string") {
                const [year, month, day] = point.time.split("-").map(Number);
                time = { year, month, day } as BusinessDay; // Fixed: Ensure time matches BusinessDay
            } else {
                time = point.time as BusinessDay;
            }

            return {
                time,
                value: point.value,
            };
        });

        processedData.sort((a, b) => {
            const aTime =
                typeof a.time === "object"
                    ? a.time.year * 10000 + a.time.month * 100 + a.time.day
                    : a.time as number;
            const bTime =
                typeof b.time === "object"
                    ? b.time.year * 10000 + b.time.month * 100 + b.time.day
                    : b.time as number;
            return aTime - bTime;
        });

        lineSeriesRef.current.setData(processedData);
        chartRef.current.timeScale().fitContent();
    }, [data, isLoading]);

    if (isLoading) {
        return (
            <div className="relative w-full h-96 rounded-md bg-gray-300 animate-pulse flex items-center justify-center">
                Loading...
            </div>
        );
    }

    return (
        <div className="relative w-full h-96">
            <div ref={chartContainerRef} className="relative w-full h-full" />
        </div>
    );
};