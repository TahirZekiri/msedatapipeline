# MSE Stock Data Processor 

## Overview 

This project automates the collection and transformation of Macedonian Stock Exchange data using a Pipe and Filter architecture. It fetches, processes, and stores daily stock data from the last 10 years for all issuers in MongoDB, making it ready for analysis.

## Goals

Automated Data Processing: Collect daily stock data for each issuer on MSE and store it in MongoDB.
Pipe and Filter Design: Use staged filters to extract, check, and format data accurately.
Performance Tracking: Measure and log processing time to populate the database.


## Setup & Installation 

### Prerequisites:
Docker and Docker Compose for MongoDB

Node.js and npm for running the pipeline
MongoDB Compass (optional for viewing data)

### Steps

**Clone the Repository:**

`git clone https://github.com/TahirZekiri/msedatapipeline`

`cd msedatapipeline/homework1`

**Start MongoDB:**
`docker-compose up -d`

MongoDB will be available at localhost:27017.

**Install Dependencies:**
`npm install`

Run the Pipeline:
`node src/main.js`

## Key Files & Structure

* **src/filter1.js**: Extracts issuer codes from the MSE site.
* **src/filters/filter2.js**: Checks MongoDB for the last available data date.
* **src/filters/filter3.js**: Retrieves missing data based on the last recorded date.
* **src/db.js**: Connects to MongoDB.
* **src/main.js**: Runs the pipeline.
* **src/timer.js**: Measures and logs the execution time.

#### Viewing Data in MongoDB (Optional)
To view data in MongoDB Compass:

Connect to `mongodb://localhost:27017`. 

Select the stockDB database to see stored stock data.
For quick debugging in WebStorm, set up Run configurations for main.js.