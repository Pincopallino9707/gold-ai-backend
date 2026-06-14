require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

const PORT = 3001;

let cachedPrice = null;
let lastFetch = 0;

// 🔥 GOLD REAL PRICE (Yahoo Finance - stabile, no API key)
async function getGoldPrice() {
  const now = Date.now();

  // cache 10 secondi (per avere aggiornamento “live” ma stabile)
  if (cachedPrice && now - lastFetch < 10000) {
    return cachedPrice;
  }

  const response = await axios.get(
    "https://query1.finance.yahoo.com/v7/finance/quote?symbols=XAUUSD%3DX"
  );

  const result = response.data?.quoteResponse?.result?.[0];

  if (!result || !result.regularMarketPrice) {
    throw new Error("Invalid Yahoo Finance response");
  }

  cachedPrice = {
    price: Number(result.regularMarketPrice),
    time: Date.now(),
  };

  lastFetch = now;

  return cachedPrice;
}

app.get("/price", async (req, res) => {
  try {
    const data = await getGoldPrice();

    res.json({
      success: true,
      data,
      source: "yahoo-finance",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});