require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

const PORT = 3001;

let cachedPrice = null;
let lastFetch = 0;

async function getGoldPrice() {
  const now = Date.now();

  // cache 60 secondi (IMPORTANTISSIMO)
  if (cachedPrice && now - lastFetch < 60000) {
    return cachedPrice;
  }

  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  const response = await axios.get(
    `https://www.alphavantage.co/query?function=GOLD_SILVER_SPOT&symbol=GOLD&apikey=${apiKey}`
  );

  cachedPrice = response.data;
  lastFetch = now;

  return cachedPrice;
}

app.get("/price", async (req, res) => {
  try {
    const data = await getGoldPrice();

    res.json({
      success: true,
      data,
      source: "alpha-vantage"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});