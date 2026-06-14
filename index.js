require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

const PORT = 3001;

let cachedPrice = null;
let lastFetch = 0;

// 🔥 TWELVE DATA GOLD PRICE
async function getGoldPrice() {
  const now = Date.now();

  // cache 10 secondi per evitare rate limit
  if (cachedPrice && now - lastFetch < 10000) {
    return cachedPrice;
  }

  const apiKey = process.env.TWELVEDATA_API_KEY;

  if (!apiKey) {
    throw new Error("Missing TWELVEDATA_API_KEY in .env");
  }

  const response = await axios.get(
    "https://api.twelvedata.com/price",
    {
      params: {
        symbol: "XAU/USD",
        apikey: apiKey,
      },
    }
  );

  const price = response.data?.price;

  if (!price) {
    throw new Error("Invalid Twelve Data response");
  }

  cachedPrice = {
    price: Number(price),
    time: Date.now(),
  };

  lastFetch = now;

  return cachedPrice;
}

// API
app.get("/price", async (req, res) => {
  try {
    const data = await getGoldPrice();

    res.json({
      success: true,
      data,
      source: "twelve-data",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});