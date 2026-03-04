import { Router } from "express";
import { createBatch, getBatchById } from "../producer";

const router = Router();

router.post("/send_prompts", createBatch);
/**
 * @swagger
 * /prompt/send_prompts:
 *   post:
 *     summary: Create a new batch of prompts
 *     description: Accepts a list of prompts and queues each one as an independent job to be processed by the Groq LLM API
 *     tags:
 *       - Batch
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompts
 *               - model
 *             properties:
 *               prompts:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - "Explain how a black hole forms"
 *                   - "Write a palindrome function in JavaScript"
 *               model:
 *                 type: string
 *                 example: "llama3-8b-8192"
 *     responses:
 *       201:
 *         description: Batch created and jobs queued successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 batchId:
 *                   type: string
 *                   example: "64f3a1b2c9e4a20012345678"
 *                 message:
 *                   type: string
 *                   example: "Batch queued successfully"
 *                 totalJobs:
 *                   type: number
 *                   example: 2
 *       400:
 *         description: Bad request — missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "prompts must be a list"
 */
router.get("/getBatch/:id", getBatchById);
/**
 * @swagger
 * /prompt/getBatch/{id}:
 *   get:
 *     summary: Get batch status and results by ID
 *     description: Returns the current status of a batch along with all job results once completed
 *     tags:
 *       - Batch
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB batch ID returned from POST /send_prompts
 *         example: "64f3a1b2c9e4a20012345678"
 *     responses:
 *       200:
 *         description: Batch found and returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 batchId:
 *                   type: string
 *                   example: "64f3a1b2c9e4a20012345678"
 *                 status:
 *                   type: string
 *                   enum: [PENDING, PROCESSING, COMPLETED]
 *                   example: "COMPLETED"
 *                 totalCount:
 *                   type: number
 *                   example: 5
 *                 completedCount:
 *                   type: number
 *                   example: 5
 *                 failedCount:
 *                   type: number
 *                   example: 0
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       prompt:
 *                         type: string
 *                         example: "Explain how a black hole forms"
 *                       response:
 *                         type: string
 *                         example: "A black hole forms when..."
 *                       tokensUsed:
 *                         type: number
 *                         example: 142
 *                       latencyMs:
 *                         type: number
 *                         example: 834
 *       404:
 *         description: Batch not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Batch not found"
 */
export default router;
