import express from "express";
import { Request, Response } from "express";
import { connection } from "./db/connect";
import { errorHandler } from "./api/middleware/error.handler";
import aiRouter from "./api/job/routes/batch.routes";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const app = express();

app.use(express.json());

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AI Prompt Batch Processor",
      version: "1.0.0",
    },
    servers: [{ url: `http://localhost:${process.env.PORT}` }],
  },
  apis: ["./src/api/job/routes/*.ts"], // ← points to your route files
};

const spec = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));
app.get("/", (req: Request, res: Response) => {
  return res.json({ message: "Hello world" });
});
app.use("/prompt", aiRouter);
app.use(errorHandler);
app.listen(process.env.PORT, () => {
  try {
    connection();
    console.log(
      `Db has been connected and listening at port ${process.env.PORT}`,
    );
  } catch (err) {
    console.log(`an error has been occured ${err}`);
  }
});
