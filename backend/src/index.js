import express from "express";
import { PORT } from "./secrets.js";
import cors from "cors";
import rootRouter from "./routes/index.routes.js";
// import booksRouter from "./routes/books.js";
// import idRouter from "./routes/id.js";
// import productRouter from "./routes/products.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", rootRouter);
// app.use("/api/books", booksRouter);
// app.use("/api", idRouter);
// app.use("/api", productRouter);

app.get("/api", (req, res) => {
  res.json("Hello World!");
});

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
