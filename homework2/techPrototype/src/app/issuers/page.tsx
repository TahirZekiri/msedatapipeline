// src/app/issuers/page.tsx
"use client";

import React, { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function IssuersPage() {
    const [selectedIssuer, setSelectedIssuer] = useState("Select Issuer");
    const [selectedTimeframe, setSelectedTimeframe] = useState("This Year");

    // Manual data for the graph
    const graphData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        datasets: [
            {
                label: "Price",
                data: [290, 300, 310, 305, 315, 320, 330],
                borderColor: "#4F46E5",
                backgroundColor: "rgba(79, 70, 229, 0.3)",
                tension: 0.4,
            },
            {
                label: "Oscillator",
                data: [50, 55, 60, 58, 65, 70, 72],
                borderColor: "#EF4444",
                backgroundColor: "rgba(239, 68, 68, 0.3)",
                tension: 0.4,
            },
        ],
    };

    const tableData = [
        { lastTrade: "290.00", min: "285.00", max: "295.00", turnover: "1,000,000", volume: "10,000" },
        { lastTrade: "300.00", min: "295.00", max: "305.00", turnover: "1,200,000", volume: "12,000" },
        { lastTrade: "310.00", min: "305.00", max: "315.00", turnover: "1,500,000", volume: "15,000" },
        { lastTrade: "290.00", min: "285.00", max: "295.00", turnover: "1,000,000", volume: "10,000" },
        { lastTrade: "300.00", min: "295.00", max: "305.00", turnover: "1,200,000", volume: "12,000" },
        { lastTrade: "310.00", min: "305.00", max: "315.00", turnover: "1,500,000", volume: "15,000" },
    ];

    return (
        <div>
            {/* Metrics and Dropdown Section */}
            <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-4 gap-6 mb-8 items-start">
                {/* Market Volume */}
                <div className="flex flex-col items-start space-y-2">
                    <span className="text-gray-500 text-sm font-medium">Market volume</span>
                    <div className="flex items-center justify-between bg-black text-white px-4 py-3 rounded-lg text-lg font-bold relative w-full h-9 max-w-sm">
                        <span className="truncate max-w-[70%]">2.200.123,00MKD</span>
                        <div className="absolute right-1 top-1 bg-green-100 text-green-700 px-1 py-1 rounded-md text-sm font-semibold">
                            +5.63%
                        </div>
                    </div>
                </div>

                {/* Market Capitalization */}
                <div className="flex flex-col items-start space-y-2">
                    <span className="text-gray-500 text-sm font-medium">Market capitalization</span>
                    <div className="flex items-center justify-between bg-black text-white px-4 py-3 rounded-lg text-lg font-bold relative w-full h-9 max-w-sm">
                        <span className="truncate max-w-[70%]">20.324.451MKD</span>
                        <div className="absolute right-1 top-1 bg-green-100 text-green-700 px-1 py-1 rounded-md text-sm font-semibold">
                            +5.63%
                        </div>
                    </div>
                </div>

                {/* Issuer Dropdown */}
                <div className="flex flex-col items-start md:items-start space-y-2 w-full">
                    <DropdownMenu>
                        <span className="text-gray-500 text-sm font-medium">Issuer</span>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full md:w-full max-w-sm justify-between">
                                {selectedIssuer}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => setSelectedIssuer("ALK")}>ALK</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setSelectedIssuer("KMB")}>KMB</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setSelectedIssuer("TMP")}>TMP</DropdownMenuItem>
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
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => setSelectedTimeframe("This Year")}>This Year</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setSelectedTimeframe("This Month")}>This Month</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setSelectedTimeframe("This Week")}>This Week</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Table and Graph Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Table */}
                <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Last Trade Price</TableHead>
                                <TableHead>Min</TableHead>
                                <TableHead>Max</TableHead>
                                <TableHead>Turnover BEST</TableHead>
                                <TableHead>Volume</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tableData.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell>{row.lastTrade}</TableCell>
                                    <TableCell>{row.min}</TableCell>
                                    <TableCell>{row.max}</TableCell>
                                    <TableCell>{row.turnover}</TableCell>
                                    <TableCell>{row.volume}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Graph */}
                <div className="p-1 bg-white shadow-md rounded-lg">
                    <h2 className="text-xl font-semibold mb-4"></h2>
                    <Line data={graphData} />
                </div>
            </div>
        </div>
    );
}