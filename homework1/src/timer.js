// src/timer.js
const fs = require("fs");

async function measureTime(fn) {
    const start = Date.now();
    console.log("Process start");
    try {
        await fn();
    } catch (error) {
        console.error("Error during timed function:", error);
    } finally {
        const executionTime = (Date.now() - start) / 1000;
        console.log("Execution time:",executionTime);
        fs.writeFileSync("executionTime.txt", `Execution time: ${executionTime} seconds\n`, { flag: "w" });
    }
}

module.exports = measureTime;