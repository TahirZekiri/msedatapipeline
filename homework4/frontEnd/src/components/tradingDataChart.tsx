import React, { useEffect, useRef } from "react";
import {
    createChart,
    IChartApi,
    ISeriesApi,
    HistogramData,
    BusinessDay,
    ColorType,
    UTCTimestamp,
} from "lightweight-charts";

interface Candle {
    time: BusinessDay | UTCTimestamp;
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

    useEffect(() => {
        if (!chartContainerRef.current) return;
        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 400,
            layout: {
                background: { type: ColorType.Solid, color: "#ffffff" },
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
                fixLeftEdge: true,
                fixRightEdge: true,
            },
        });

        chartRef.current = chart;

        const candleSeries = chart.addCandlestickSeries({
            upColor: "#4caf50",
            downColor: "#f44336",
            borderUpColor: "#4caf50",
            borderDownColor: "#f44336",
            wickUpColor: "#4caf50",
            wickDownColor: "#f44336",
        });
        candleSeriesRef.current = candleSeries;

        const volumeSeries = chart.addHistogramSeries({
            priceFormat: {
                type: "volume",
            },
            priceLineVisible: false,
            color: "#26a69a",
            priceScaleId: "",
        });
        volumeSeriesRef.current = volumeSeries;

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
    }, []);

    useEffect(() => {
        if (candleSeriesRef.current && data.length) {
            let lastValidHigh = data[0].high;
            let lastValidLow = data[0].low;

            const processedData = data
                .map((candle) => {
                    if (candle.high === null) candle.high = lastValidHigh;
                    else lastValidHigh = candle.high;

                    if (candle.low === null) candle.low = lastValidLow;
                    else lastValidLow = candle.low;

                    return candle;
                })
                .filter((item, index, self) => index === 0 || item.time !== self[index - 1].time)
                .sort((a, b) => {
                    const timeA =
                        typeof a.time === "number"
                            ? a.time
                            : new Date(`${a.time.year}-${a.time.month}-${a.time.day}`).getTime() / 1000;
                    const timeB =
                        typeof b.time === "number"
                            ? b.time
                            : new Date(`${b.time.year}-${b.time.month}-${b.time.day}`).getTime() / 1000;
                    return timeA - timeB;
                });

            candleSeriesRef.current.setData(
                processedData.map((candle) => ({
                    time: candle.time,
                    open: candle.open,
                    high: candle.high!,
                    low: candle.low!,
                    close: candle.close,
                }))
            );

            const volumeData: HistogramData[] = processedData.map((d) => ({
                time: d.time,
                value: d.volume,
                color: d.close > d.open ? "#4caf50" : "#f44336",
            }));

            volumeSeriesRef.current?.setData(volumeData);

            chartRef.current?.timeScale().fitContent();

            const minTime = processedData[0].time;
            const maxTime = processedData[processedData.length - 1].time;
            chartRef.current?.timeScale().setVisibleRange({ from: minTime, to: maxTime });
        }
    }, [data]);

    return (
        <div className="relative w-full h-96">
            <div ref={chartContainerRef} className="relative w-full h-full" />
        </div>
    );
};