"use client";

import React from "react";
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    TimeScale,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { format } from "date-fns";
import zoomPlugin from "chartjs-plugin-zoom";
import { ChartOptions } from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, TimeScale, Tooltip, Legend, zoomPlugin);

interface LineChartProps {
    data: {
        labels: string[];
        datasets: { label: string; data: number[]; borderColor: string; backgroundColor: string; tension: number }[];
    };
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
    const minDate = new Date(data.labels[0]);
    const maxDate = new Date(data.labels[data.labels.length - 1]);

    const options: ChartOptions<"line"> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                enabled: true,
            },
            zoom: {
                zoom: {
                    wheel: {
                        enabled: true,
                    },
                    pinch: {
                        enabled: true,
                    },
                    mode: "x",
                },
                pan: {
                    enabled: true,
                    mode: "x",
                },
                limits: {
                    x: {
                        min: minDate.getTime(),
                        max: maxDate.getTime(),
                    },
                },
            },
        },
        scales: {
            x: {
                type: "time",
                time: {
                    unit: "month",
                    tooltipFormat: "dd.MM.yy",
                    displayFormats: {
                        month: "MMM yy",
                    },
                },
                ticks: {
                    callback: (value, index, ticks) => {
                        const date = new Date(value as number);
                        const month = date.getMonth();
                        return month % 2 === 0 ? format(date, "MMM yy") : "";
                    },
                },
                min: minDate.getTime(),
                max: maxDate.getTime(),
            },
            y: {
                beginAtZero: true,
            },
        },
    };

    return <Line data={data} options={options} />;
};

export default LineChart;
