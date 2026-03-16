import express from "express";
import routes from "./routes";
import {
  register,
  httpRequestCounter,
  httpRequestDuration,
} from "./metrics";
import { httpLogger } from "./httpLogger";
import { logger } from "./logger";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(httpLogger);

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();

  res.on("finish", () => {
    const labels = {
      method: req.method,
      route: req.path,
      status_code: String(res.statusCode),
    };

    httpRequestCounter.inc(labels);
    end(labels);
  });

  next();
});

app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.use(routes);

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});
