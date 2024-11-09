// src/timer.js
const fs = require("fs");

async function measureTime(fn) {
    const start = Date.now();
    await fn();
    const end = Date.now();
    const executionTime = (end - start) / 1000;

    const output = `Execution time: ${executionTime} seconds\n`;
    console.log(output);

    fs.writeFileSync("executionTime.txt", output, { flag: "w" });
}

module.exports = measureTime;