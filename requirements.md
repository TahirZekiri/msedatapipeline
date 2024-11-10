Functional Requirements 

Issuer Retrieval: The application should automatically retrieve all issuers listed on the Macedonian Stock Exchange website, excluding bonds and codes containing numbers.
Last Date Check: For each issuer, the application should check the database to determine the last recorded date.
Data Retrieval and Completion: The application should fill in any missing data from the last recorded date to the current date, ensuring no gaps.
Date Formatting: Dates should be stored in the English format YYYY-MM-DD to maintain consistency.
Price Formatting: Prices should be formatted according to Macedonian standards, using commas for thousands and periods for decimals.
Database Population: The application should be able to populate an empty database with data for all issuers if no existing data is available.


Non-Functional Requirements

Performance: The application should minimize data retrieval time and optimize database population speed.
Scalability: The system should handle an increasing number of issuers and larger volumes of data efficiently.
Reliability: The application must handle network interruptions gracefully, retrying failed data retrievals as necessary.
Maintainability: Each module should function independently, allowing easy modification or addition of new filters.
Usability: The application should provide clear console outputs/logs detailing the current processing stage and any errors.

User Scenarios and Personas

Persona 1: Data Analyst

Scenario: A data analyst at a financial institution wants to access up-to-date stock data for Macedonian issuers to generate reports on market trends.
Action: The analyst runs the application, which automatically populates and updates the database. After the application finishes, they access the structured data from the database for analysis.

Persona 2: System Administrator

Scenario: A system administrator wants to check the application’s performance and ensure data consistency.
Action: The administrator starts the application, monitors console output for progress and potential errors, and uses the timer report to assess data processing speed.


Narrative

Upon launching the application, the system connects to the Macedonian Stock Exchange website and retrieves a list of all issuers, filtering out non-stock entities (e.g., bonds). Each issuer’s historical stock data is processed in stages to ensure that only new, accurate data is added to the database. First, the system checks the last date of data stored for each issuer to avoid duplication. For issuers missing recent data, the application fetches updated records up to the current date.

Each filter in the pipeline is responsible for specific data transformations. The system formats dates in the YYYY-MM-DD style and applies Macedonian numeric formatting to stock prices, ensuring the data is correctly structured for subsequent use. The application also records the time taken for this entire process, allowing the team to measure and optimize performance continuously.

This workflow results in a highly efficient, automated data management solution that minimizes redundancy, maintains data accuracy, and supports rapid performance evaluation.