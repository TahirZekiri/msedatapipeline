Project Description
This project is designed to automate the retrieval, transformation, and storage of stock market data from the Macedonian Stock Exchange. Our application is built with the Pipe and Filter architectural pattern to ensure modular, efficient, and maintainable data processing. The primary objective is to populate a database with accurate, complete, and up-to-date stock data for all issuers listed on the Macedonian Stock Exchange, enabling further analysis and reporting.

The project consists of several filters (modules) that handle distinct tasks in a sequential manner, where the output of each filter feeds into the next. Each issuer’s data is processed through multiple stages, including retrieval, date checking, missing data filling, and formatting. Specifically, the data processing includes:

Automatic Issuer Retrieval: Extracts a list of all valid issuers from the stock exchange website.
Date Checking: Determines the last recorded date for each issuer in the database to avoid redundant data retrieval.
Data Completion and Transformation: Fetches missing data for each issuer up to the current date and ensures all fields, including dates and prices, are accurately formatted.
In addition to providing stock market data in a structured and ready-to-use format, our application optimizes processing speed by measuring time-to-populate and improving efficiency. This project, therefore, provides a robust foundation for handling financial data in a scalable way, enabling the team to process extensive data from multiple sources efficiently.

