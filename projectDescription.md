# Project Description
This project automates the retrieval, transformation, and storage of historical stock data from the Macedonian Stock Exchange (MSE) using a modular Pipe and Filter architecture. The application gathers and processes daily stock data for all issuers over the last 10 years, storing it in MongoDB for analysis. By dividing tasks into filters that process data sequentially, the application ensures accurate and efficient data handling.

## Data Processing Flow
* **Automatic Issuer Retrieval**: The first filter scrapes the MSE website, extracting a list of valid issuer codes (excluding bonds and non-stock entities). This ensures all relevant issuers are included without manual intervention.
* **Date Checking**: The second filter connects to MongoDB to determine the last date of recorded data for each issuer. If data already exists, the filter identifies only the missing dates; if no data exists, it triggers data fetching from the past 10 years.
* **Data Completion and Transformation**: The final filter retrieves the missing data from MSE in daily increments, converting all dates to YYYY-MM-DD format and formatting prices according to Macedonian standards (e.g., 1.234.567,89). Only the essential fields (e.g., date, last trade price, volume) are retained, ensuring consistency across entries.

## Code Structure & Flow
1. **src/filter1.js**: Scrapes the MSE website, identifying and capturing valid issuer codes.
2. **src/filters/filter2.js**: Connects to MongoDB to check each issuer’s latest data, passing only missing dates to the next filter.
3. **src/filters/filter3.js**: Retrieves missing daily stock data, formats it as required, and adds it to MongoDB.
4. **src/db.js**: Manages the MongoDB connection.
5. **src/main.js**: Runs the data pipeline in sequence, ensuring each filter processes data correctly.
6. **src/timer.js**: Measures and logs the total time taken to complete data population, allowing for optimization.

### Website Scraping Details

Data scraping is performed via the MSE’s historical data pages, using Cheerio and Axios to access and parse HTML tables. Requests are made incrementally to handle large date ranges without overloading the server. Retries are implemented for network resilience, ensuring a reliable data pipeline.

This project results in a comprehensive and up-to-date stock data repository, stored efficiently in MongoDB and ready for analysis, reporting, or further processing.