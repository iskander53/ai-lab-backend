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


app.post("/checkout", async (req, res) => {
  const { user_id, order_id, items } = req.body;

  if (!user_id || !order_id || !items || !Array.isArray(items)) {
    return res
      .status(400)
      .json({ error: "user_id, order_id и items (array) обязательны" });
  }

  // Готовим массив строк для вставки
  const orderRows = items.map((item) => ({
    user_id,
    order_id,
    item_id: item.item_id,
    qty: item.qty,
    total_price: item.total_price,
  }));

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_API_KEY,
        Authorization: `Bearer ${SUPABASE_API_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation", // чтобы вернулся массив вставленных строк
      },
      body: JSON.stringify(orderRows),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    res.json({ success: true, order: data });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- Server ---
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
