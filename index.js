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

  const apiKey = process.env.TWELVEDATA_API_KEY;

  if (!apiKey) {
    throw new Error("TWELVEDATA_API_KEY missing");
  }

  const response = await axios.get(
    "https://api.twelvedata.com/price",
    {
      params: {
        symbol: "XAUUSD",
        apikey: apiKey,
      },
    }
  );

  console.log("TWELVE DATA RAW:", response.data);

  if (response.data.status === "error") {
    throw new Error(
      response.data.message || "Twelve Data API error"
    );
  }

  const price = Number(response.data.price);

  if (isNaN(price)) {
    throw new Error("Invalid Twelve Data price");
  }

  cachedPrice = {
    price,
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
      source: "twelve-data",
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});