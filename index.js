require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

let cached = null;
let lastFetch = 0;

// 📊 GET CANDLES (1 MINUTE)
async function getMarketData() {
  const now = Date.now();

  if (cached && now - lastFetch < 5000) {
    return cached;
  }

  const apiKey = process.env.TWELVEDATA_API_KEY;

  if (!apiKey) {
    throw new Error("TWELVEDATA_API_KEY missing");
  }

  // 🕯️ OHLC candles
  const response = await axios.get(
    "https://api.twelvedata.com/time_series",
    {
      params: {
        symbol: "XAU/USD",
        interval: "1min",
        outputsize: 100,
        apikey: apiKey,
      },
    }
  );

  if (!response.data?.values) {
    throw new Error("Invalid candle data from Twelve Data");
  }

  const candles = response.data.values.map((c) => ({
    time: c.datetime,
    open: Number(c.open),
    high: Number(c.high),
    low: Number(c.low),
    close: Number(c.close),
  }));

  const last = candles[0];

  cached = {
    price: last.close,
    open: last.open,
    high: last.high,
    low: last.low,
    candles,
    time: Date.now(),
    source: "twelve-data",
  };

  lastFetch = now;

  return cached;
}

// 🚀 PRICE ENDPOINT
app.get("/price", async (req, res) => {
  try {
    const data = await getMarketData();

    res.json({
      success: true,
      data,
      source: "twelve-data-candles",
    });
  } catch (error) {
    console.error("ERROR:", error.message);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});