"use client";

import React from "react";
import { Sparklines, SparklinesLine } from "react-sparklines";

interface SparklineChartProps {
    data: number[];
    color?: string;
    width?: number;
    height?: number;
    isLoading?: boolean;
}

export function SparklineChart({
                                   data,
                                   color = "blue",
                                   width = 100,
                                   height = 30,
                                   isLoading = false,
                               }: SparklineChartProps) {
    if (isLoading) {
        return (
            <div className="relative w-full h-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-full animate-pulse bg-gray-200" />
                <svg
                    viewBox="0 0 100 20"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full text-blue-400 animate-moving-line"
                >
                    <path
                        d="M0,10 C20,5 40,15 60,10 C80,5 100,10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                </svg>
            </div>
        );
    }

    return (
        <Sparklines data={data} width={width} height={height} margin={4}>
            <SparklinesLine
                color={color}
                style={{ strokeWidth: 2, fill: "rgba(66, 153, 225, 0.15)" }}
            />
        </Sparklines>
    );
}