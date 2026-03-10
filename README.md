# 🤖 AI Prompt Batch Processor

A Node.js backend system that accepts a list of prompts in a single HTTP request and processes them asynchronously using a job queue. Each prompt is handled independently by a worker that calls the Groq LLM API, and all results are persisted in MongoDB.

---

## 🚀 How It Works

1. Client sends `POST /api/send_prompts` with a list of prompts
2. A **Batch** document is created in MongoDB as a progress tracker
3. Each prompt is enqueued as an independent **BullMQ job** in Redis
4. A **Job** document is created in MongoDB for each prompt
5. The worker picks up each job, calls the **Groq API**, and saves the result
6. Client polls `GET /api/getBatch/:id` to check status and retrieve results

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express** | REST API layer |
| **TypeScript** | Type safety across the codebase |
| **BullMQ** | Job queue manager |
| **Redis** | In-memory store for queued jobs (min v6.2.0) |
| **Groq SDK** | LLM API client for processing prompts |
| **Mongoose** | MongoDB ODM for schema definitions and queries |
| **Fastify/Error** | Structured error handling |
| **Dotenv** | Environment variable management |
| **Nodemon** | Auto-restart during development |
| **Swagger** | API documentation |

---

## 📁 Project Structure

```
src/
├── main.ts                  # Express app entry point
├── routes/
│   └── batch.route.ts       # POST /send_prompts, GET /getBatch/:id
├── controllers/
│   └── producer.ts          # createBatch and getBatchById handlers
├── worker/
│   └── worker.ts            # BullMQ worker — calls Groq, saves results
├── db/
│   └── models/
│       ├── batch.model.ts   # Batch schema
│       ├── job.model.ts     # Job schema
│       └── result.model.ts  # Result schema
└── utils/
    ├── asyncHandler.ts      # Async error wrapper
    └── errorFastify.ts      # Custom error classes
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- Redis v6.2.0+ (via Docker recommended)
- MongoDB running locally or via Atlas
- Groq API key from [console.groq.com](https://console.groq.com)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/AI_PromptQueue.git
cd AI_PromptQueue
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create your `.env` file
```env
PORT=5000
DB_URL=mongodb://localhost:27017/Ai_Prompt
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Start Redis via Docker
```bash
docker run -d --name redis7 -p 6379:6379 redis:7
```

### 5. Run the server and worker in separate terminals

```bash
# Terminal 1 — Express server
npm run dev

# Terminal 2 — BullMQ worker
npm run worker
```

---

## 📡 API Endpoints

### `POST /api/send_prompts`
Submit a batch of prompts to be processed.

**Request Body**
```json
{
  "prompts": [
    "Explain how a black hole forms",
    "Write a palindrome function in JavaScript",
    "Summarize the plot of Romeo and Juliet"
  ],
  "model": "llama3-8b-8192"
}
```

**Response**
```json
{
  "message": "Worked out",
  "success": true,
  "batch": {
    "_id": "64f3a1b2c9e4a20012345678",
    "totalCount": 3,
    "completedCount": 0,
    "failedCount": 0,
    "status": "PENDING"
  }
}
```

---

### `GET /api/getBatch/:id`
Get the current status and results of a batch.

**Response**
```json
{
  "message": "batch found",
  "success": true,
  "findBatch": {
    "_id": "64f3a1b2c9e4a20012345678",
    "totalCount": 3,
    "completedCount": 3,
    "failedCount": 0,
    "status": "COMPLETED",
    "completedAt": "2025-03-04T10:00:00.000Z"
  }
}
```

---

## 📊 MongoDB Collections

### Batch
Tracks overall progress of a submitted batch.

| Field | Type | Description |
|---|---|---|
| `totalCount` | Number | Total number of prompts submitted |
| `completedCount` | Number | Number of successfully processed prompts |
| `failedCount` | Number | Number of failed prompts |
| `status` | String | `PENDING` / `PROCESSING` / `COMPLETED` |
| `completedAt` | Date | Timestamp when batch finished |

### Job
One document per prompt in a batch.

| Field | Type | Description |
|---|---|---|
| `batchId` | ObjectId | Reference to parent Batch |
| `bullJobId` | String | BullMQ job ID from Redis |
| `prompt` | String | The individual prompt text |
| `model` | String | Groq model used |
| `status` | String | `QUEUED` / `PROCESSING` / `COMPLETED` / `FAILED` |
| `attempts` | Number | Number of processing attempts |

### Result
Stores the LLM response for each completed job.

| Field | Type | Description |
|---|---|---|
| `batchId` | ObjectId | Reference to parent Batch |
| `bullJobId` | String | Reference to the BullMQ job |
| `response` | String | LLM generated response |
| `model` | String | Groq model used |
| `tokensUsed` | Number | Total tokens consumed |
| `latencyMs` | Number | Groq API response time in ms |

---

## 📖 API Documentation

Swagger UI is available at:
```
http://localhost:5000/api-docs
```

---

## 🔒 Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Express server port |
| `DB_URL` | MongoDB connection string |
| `REDIS_HOST` | Redis host address |
| `REDIS_PORT` | Redis port |
| `GROQ_API_KEY` | Groq API key from console.groq.com |

> ⚠️ Never commit your `.env` file. It is listed in `.gitignore`.

---

## 📜 Scripts

```bash
npm run dev      # Start Express server with nodemon
npm run worker   # Start BullMQ worker with nodemon
```

---

## 🤖 Supported Groq Models

| Model | Best For |
|---|---|
| `llama3-8b-8192` | Fast, simple tasks |
| `llama3-70b-8192` | Complex reasoning |
| `mixtral-8x7b-32768` | Long context, summarization |
| `gemma-7b-it` | Instruction following |
