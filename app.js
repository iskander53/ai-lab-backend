import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors());

// Supabase credentials
const SUPABASE_URL = "https://xkcvngknoyonqgmhlexs.supabase.co";
const SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrY3ZuZ2tub3lvbnFnbWhsZXhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU2MDMzMSwiZXhwIjoyMDc2MTM2MzMxfQ.02iBG3uhyP51F5vl1LFlzGIXEcuCGS-D5hEetXRphuU";

// --- Endpoints ---
// Список категорий
app.get("/categories", async (req, res) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/categories`, {
      method: "GET",
      headers: {
        apikey: SUPABASE_API_KEY,
        Authorization: `Bearer ${SUPABASE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Товары по категории
app.get("/category/:id", async (req, res) => {
  const categoryId = req.params.id;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/products?category_id=eq.${categoryId}`,
      {
        method: "GET",
        headers: {
          apikey: SUPABASE_API_KEY,
          Authorization: `Bearer ${SUPABASE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.statusText}`);
    }

    const products = await response.json();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- Server ---
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
