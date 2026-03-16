import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { logger } from "./logger";

const router: ExpressRouter = Router();

type User = {
  id: number;
  name: string;
};

let users: User[] = [];

router.get("/health", (_req, res) => {
  logger.info({ route: "/health" }, "Health check called");
  res.json({ status: "ok" });
});

router.get("/users", (_req, res) => {
  logger.info({ route: "/users", count: users.length }, "Fetched users");
  res.json(users);
});

router.post("/users", (req, res) => {
  const name = req.body.name;

  if (!name) {
    logger.warn({ route: "/users" }, "User creation failed: name is required");
    return res.status(400).json({ message: "name is required" });
  }

  const user: User = {
    id: Date.now(),
    name,
  };

  users.push(user);

  logger.info({ route: "/users", userId: user.id }, "User created");
  return res.status(201).json(user);
});

router.delete("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  users = users.filter((u) => u.id !== id);

  logger.info({ route: "/users/:id", deletedId: id }, "User deleted");
  res.sendStatus(204);
});

router.get("/error", (_req, res) => {
  logger.error({ route: "/error" }, "Simulated server failure triggered");
  res.status(500).send("Simulated failure");
});

router.get("/slow", async (_req, res) => {
  logger.info({ route: "/slow" }, "Slow endpoint triggered");

  await new Promise((resolve) => setTimeout(resolve, 3000));

  res.json({ message: "Slow response completed" });
});

export default router;