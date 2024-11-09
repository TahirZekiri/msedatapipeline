MSE Stock Data Processor
Project Overview
This project is designed to automate the collection and transformation of stock data from the Macedonian Stock Exchange. It demonstrates a Pipe and Filter architecture, where data is fetched, processed, and stored in MongoDB for analysis purposes. The application focuses on historical daily stock data over the last 10 years for all issuers.

Goals
Automate Data Processing: Fetch daily stock data for each issuer on the Macedonian Stock Exchange (MSE) and store it in MongoDB.
Pipe and Filter Architecture: Use filters to transform data in stages, ensuring that only necessary and correctly formatted data is retained.
Performance Tracking: Implement a timer to measure the time taken for database population.
Requirements
This project is based on the requirements from the "Software Design and Architecture" course assignment.

Setup and Installation
Prerequisites
Docker and Docker Compose
Node.js and npm
MongoDB Compass (optional, for database viewing)

Step 1: Clone the Repository
git clone <https://github.com/TahirZekiri/msedatapipeline>
cd msedatapipeline/homework1

Step 2: Start MongoDB with Docker Compose
docker-compose up -d

This will start a MongoDB instance at localhost:27017.

Step 3: Install Node.js Dependencies
npm install

Step 4: Run the Pipeline
Execute the pipeline with the following command:
node src/main.js


Explanation of Files and Code
Key Scripts
src/dataFetch.js: Scrapes issuer codes from the MSE website.
src/filters/checkLastDate.js: Checks the last available data date in MongoDB.
src/filters/fillMissingData.js: Fetches missing data from MSE based on the last available date.
src/db.js: Establishes a MongoDB connection.
src/main.js: Executes the pipeline in sequence.
src/timer.js: Measures the time taken for database population.

MongoDB Compass (Optional for Viewing Data)
Open MongoDB Compass and connect to mongodb://localhost:27017.
Select the stockMarketDB database to view stored collections.

Running the Project with WebStorm
If you are using WebStorm, you can set up Run/Debug configurations for main.js to run the pipeline with one click. This also makes it easier to debug and track variables throughout execution.

To measure the time taken for full database population, use the timer provided in src/timer.js. This will output the time in milliseconds.
