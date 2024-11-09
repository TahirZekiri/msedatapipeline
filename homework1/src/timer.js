// src/timer.js
function measureTime(fn) {
    const start = Date.now();
    fn().then(() => {
        const end = Date.now();
        console.log(`Execution time: ${end - start}ms`);
    });
}

module.exports = measureTime;