const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = 3001;

// 💡 GOLD MOCK STABILE (per evitare blocchi API)
// poi lo sostituiamo con feed reale quando deployi
let price = 2350;

setInterval(() => {
  const change = (Math.random() - 0.5) * 2;
  price = +(price + change).toFixed(2);
}, 3000);

app.get("/price", (req, res) => {
  res.json({
    success: true,
    price,
    time: Date.now(),
    source: "simulated-stable-feed"
  });
});

app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});