require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

const PORT = 3001;

app.get("/price", async (req, res) => {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GOLD_SILVER_SPOT&symbol=GOLD&apikey=${apiKey}`
    );

    res.json({
      success: true,
      data: response.data,
      source: "alpha-vantage"
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});