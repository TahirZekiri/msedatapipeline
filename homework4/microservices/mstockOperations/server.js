const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./db");
const issuersRoutes = require("./routes/issuers");
const stockDataRoutes = require("./routes/stockData");
const technicalAnalysisRoutes = require("./routes/technicalAnalysis");

dotenv.config();
const app = express();

// Allow CORS from any origin
app.use(cors({
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
}));

app.use(express.json());

let db;

(async () => {
    db = await connectDB();

    // Middleware to inject database into requests
    app.use((req, res, next) => {
        req.db = db;
        next();
    });

    // Route definitions
    app.use("/api/issuers", issuersRoutes);
    app.use("/api/stockData", stockDataRoutes);
    app.use("/api/technicalAnalysis", technicalAnalysisRoutes);

    // Starting the server
    const PORT = process.env.PORT || 5011;
    app.listen(PORT, () => {
        console.log(`mstockOperations microservice running on http://localhost:${PORT}`);
    });
})();