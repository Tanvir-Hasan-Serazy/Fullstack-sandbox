import express from "express";
import { PORT } from "./secrets.js";
import rootRouter from "./routes/index.js";

const app = express();

app.use(express.json());
app.use("/api", rootRouter);

app.get("/api", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
