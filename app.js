import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors()); // <--- allow all origins
app.use(express.json()); // чтобы парсить JSON из тела запроса


// Supabase credentials
const SUPABASE_URL = "https://xkcvngknoyonqgmhlexs.supabase.co";
const SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrY3ZuZ2tub3lvbnFnbWhsZXhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU2MDMzMSwiZXhwIjoyMDc2MTM2MzMxfQ.02iBG3uhyP51F5vl1LFlzGIXEcuCGS-D5hEetXRphuU";


// Categories endpoint
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


// Endpoint for products by category_id
app.get("/category/:id", async (req, res) => {
  try {
    const categoryId = req.params.id; // Получаем category_id из URL

    const response = await fetch(`${SUPABASE_URL}/rest/v1/products?category_id=eq.${categoryId}`, {
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

    const products = await response.json();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});



app.post("/checkout", async (req, res) => {
  try {
    const { user_id, order_id, items } = req.body;

    if (!user_id || !order_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "user_id, order_id и items обязательны" });
    }

    // Формируем массив объектов для вставки
    const rows = items.map(item => ({
      user_id,
      item_id: item.item_id,
      qty: item.qty,
      total_price: item.total_price,
      order_id
    }));

    // Отправляем запрос на Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_API_KEY,
        Authorization: `Bearer ${SUPABASE_API_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation" // чтобы Supabase вернул вставленные строки
      },
      body: JSON.stringify(rows)
    });

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.statusText}`);
    }

    const savedOrders = await response.json();
    res.json(savedOrders);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});



app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
