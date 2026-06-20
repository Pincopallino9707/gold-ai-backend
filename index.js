require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

let cachedPrice = null;
let lastFetch = 0;

async function getGoldPrice() {
  const now = Date.now();

  if (cachedPrice && now - lastFetch < 10000) {
    return cachedPrice;
  }

  const apiKey = process.env.GOLDAPI_KEY;

  if (!apiKey) {
    throw new Error("GOLDAPI_KEY missing");
  }

  try {
    const response = await axios.get(
      "https://www.goldapi.io/api/XAU/USD",
      {
        headers: {
          "x-access-token": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    const price = Number(response.data.price);

    if (isNaN(price)) {
      throw new Error("Invalid GoldAPI price");
    }

    cachedPrice = {
      price,
      time: Date.now(),
    };

    lastFetch = now;

    return cachedPrice;

  } catch (error) {
    console.error("GOLD API ERROR:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || error.message);
  }
}

app.get("/price", async (req, res) => {
  try {
    const data = await getGoldPrice();

    res.json({
      success: true,
      data,
      source: "goldapi",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});