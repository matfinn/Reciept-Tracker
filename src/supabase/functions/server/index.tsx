import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-3ca8e58f/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all expenses
app.get("/make-server-3ca8e58f/expenses", async (c) => {
  try {
    const expenses = await kv.getByPrefix("expense:");
    return c.json({ expenses: expenses || [] });
  } catch (error) {
    console.log("Error fetching expenses:", error);
    return c.json({ error: "Failed to fetch expenses", details: String(error) }, 500);
  }
});

// Save a new expense
app.post("/make-server-3ca8e58f/expenses", async (c) => {
  try {
    const expense = await c.req.json();
    const key = `expense:${expense.id}`;
    await kv.set(key, expense);
    return c.json({ success: true, expense });
  } catch (error) {
    console.log("Error saving expense:", error);
    return c.json({ error: "Failed to save expense", details: String(error) }, 500);
  }
});

// Update an expense
app.put("/make-server-3ca8e58f/expenses/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const expense = await c.req.json();
    const key = `expense:${id}`;
    await kv.set(key, expense);
    return c.json({ success: true, expense });
  } catch (error) {
    console.log("Error updating expense:", error);
    return c.json({ error: "Failed to update expense", details: String(error) }, 500);
  }
});

// Delete an expense
app.delete("/make-server-3ca8e58f/expenses/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const key = `expense:${id}`;
    await kv.del(key);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting expense:", error);
    return c.json({ error: "Failed to delete expense", details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);