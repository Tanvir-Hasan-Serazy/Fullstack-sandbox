import express from "express";
import { PORT } from "./secrets.js";
import rootRouter from "./routes/index.js";
import cors from "cors";
import booksRouter from "./routes/books.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", rootRouter);
app.use("/api/books", booksRouter);

app.get("/api", (req, res) => {
  res.json("Hello World!");
});

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
