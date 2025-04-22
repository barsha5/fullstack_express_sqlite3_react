# Express.js API Template

This project is a simple starting point for building RESTful APIs using **Express.js**. It includes a basic setup with a single route (`/ping`) and a test suite using **Jest** and **Supertest**.

## 🛠️ Getting Started

### 1. Install Dependencies

Run the following command to install the required dependencies:

```bash
npm install
```
### 2. Test the Application

Run the test suite using:

```bash
npm test
```
This will execute the tests defined in the `tests/app.test.js` file. The test checks if the `/ping` endpoint returns a 200 status code and the expected response.
### 3. Start the Server

To start the server, run:

```bash
node index.js
```

The server will start on `http://localhost:3000` by default.



## 📂 Project Structure

```
template-expressJS/
├── app.js          # Express app setup
├── index.js        # Entry point for the server
├── package.json    # Project metadata and dependencies
├── readMe.md       # Documentation
├── tests/          # Test files
│   └── app.test.js # Tests for the app
```

## 🚀 API Endpoints

### GET /ping

- **Description**: Returns a simple "pong" message.
- **Response**:
  ```json
  {
    "message": "pong"
  }
  ```

## 🧪 Testing

The project uses **Jest** and **Supertest** for testing. The test file [`tests/app.test.js`](tests/app.test.js) includes a test for the `/ping` endpoint.

## 📜 License

This project is licensed under the ISC License.