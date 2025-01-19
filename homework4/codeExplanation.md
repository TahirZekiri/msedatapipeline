# Code Explanation

### Model-View-Template Pattern

The front-end application uses the Model-View-Template pattern where the views handle the logic and interactions with APIs, and the templates render the user interface. React components serve as templates that dynamically display data fetched from the microservices.

---
### Factory Pattern
The Factory Pattern is used in the data pipeline to dynamically create HTTP requests for fetching stock data for different issuers. The filter1 function acts as the creator, centralizing request generation logic to maintain scalability and asynchronous processing.

---

### Pipeline Pattern

The Pipeline Pattern is implemented in the data pipeline microservice. It processes raw stock data through multiple stages, such as filtering issuers (filter1), retrieving the latest data (filter2), and applying transformations (filter3) before completing the data pipeline.

---

### Scheduled-Task Pattern

Using the node-schedule library in the data pipeline service, the Scheduled-Task Pattern is implemented to automate the execution of the runPipeline function at specific intervals (e.g., daily at midnight). This ensures regular updates while decoupling the scheduler logic from the task logic for better reusability.