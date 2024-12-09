"use client";

import React, { useEffect, useRef } from "react";
import { createChart, IChartApi, ISeriesApi, BarData, BusinessDay } from "lightweight-charts";

interface Candle {
    time: BusinessDay;
    open: number;
    high: number | null;
    low: number | null;
    close: number;
    volume: number;
}

interface TradingDataChartProps {
    data: Candle[];
}

export const TradingDataChart: React.FC<TradingDataChartProps> = ({ data }) => {
    const chartContainerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Initialize chart
        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 400,
            layout: {
                background: { type: "Solid", color: "#ffffff" },
                textColor: "#222",
                fontSize: 12,
            },
            grid: {
                vertLines: { color: "#f0f0f0" },
                horzLines: { color: "#f0f0f0" },
            },
            rightPriceScale: {
                borderVisible: false,
            },
            timeScale: {
                borderVisible: false,
                timeVisible: true,
                secondsVisible: false,
            },
        });

        chartRef.current = chart;

        // Candlestick Series
        const candleSeries = chart.addCandlestickSeries({
            upColor: "#4caf50",
            downColor: "#f44336",
            borderUpColor: "#4caf50",
            borderDownColor: "#f44336",
            wickUpColor: "#4caf50",
            wickDownColor: "#f44336",
        });
        candleSeriesRef.current = candleSeries;

        // Volume Histogram Series
        const volumeSeries = chart.addHistogramSeries({
            priceFormat: {
                type: "volume",
            },
            priceLineVisible: false,
            color: "#26a69a",
            priceScaleId: "",
            scaleMargins: {
                top: 0.85,
                bottom: 0.1,
            },
            overlay: true, // Overlay on candlestick chart
            opacity: 0.5, // Semi-transparent
        });
        volumeSeriesRef.current = volumeSeries;

        // Tooltip for crosshair
        const tooltip = document.createElement("div");
        tooltip.style.position = "absolute";
        tooltip.style.display = "none";
        tooltip.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
        tooltip.style.border = "1px solid #ccc";
        tooltip.style.padding = "5px";
        tooltip.style.borderRadius = "4px";
        tooltip.style.fontSize = "12px";
        tooltip.style.pointerEvents = "none";
        chartContainerRef.current.appendChild(tooltip);
        tooltipRef.current = tooltip;

        // Resize handling
        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            chart.remove();
            if (tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
        };
    }, []);

    useEffect(() => {
        if (candleSeriesRef.current && volumeSeriesRef.current && data.length) {
            // Handle missing min/max values
            let lastValidHigh = data[0].high;
            let lastValidLow = data[0].low;

            const processedData = data.map((candle) => {
                if (candle.high === null) candle.high = lastValidHigh;
                else lastValidHigh = candle.high;

                if (candle.low === null) candle.low = lastValidLow;
                else lastValidLow = candle.low;

                return candle;
            });

            // Set candlestick data
            candleSeriesRef.current.setData(processedData);

            // Set volume data
            const volumeData = processedData.map((d) => ({
                time: d.time,
                value: d.volume,
                color: d.close > d.open ? "#4caf50" : "#f44336",
            })) as (BarData & { color: string })[];

            volumeSeriesRef.current.setData(volumeData);

            // Fit all data into view
            chartRef.current?.timeScale().fitContent();

            // Restrict zoom to available data
            const minTime = processedData[0].time;
            const maxTime = processedData[processedData.length - 1].time;
            chartRef.current?.timeScale().setVisibleRange({ from: minTime, to: maxTime });

            // Add crosshair tooltip
            chartRef.current.subscribeCrosshairMove((param) => {
                if (!tooltipRef.current || !param.time || !param.seriesPrices) {
                    tooltipRef.current.style.display = "none";
                    return;
                }

                const price = param.seriesPrices.get(candleSeriesRef.current);
                const volume = param.seriesPrices.get(volumeSeriesRef.current);

                tooltipRef.current.innerHTML = `
                    <div><strong>Price</strong>: ${price ?? "-"}</div>
                    <div><strong>Volume</strong>: ${volume ?? "-"}</div>
                `;
                tooltipRef.current.style.display = "block";
                tooltipRef.current.style.left = `${param.point?.x}px`;
                tooltipRef.current.style.top = `${param.point?.y}px`;
            });
        }
    }, [data]);

    return (
        <div className="relative w-full h-96">
            <div ref={chartContainerRef} className="relative w-full h-full" />
        </div>
    );
};