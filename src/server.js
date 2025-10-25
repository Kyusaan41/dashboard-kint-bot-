
const express = require('express');
const fs = require('fs');
const app = express();
const cors = require('cors');
const PORT = 3001;

app.use(cors());
app.use(express.json());


app.get('/api/xp', (req, res) => {
  const data = fs.readFileSync('./data/XP.json', 'utf-8');
  res.json(JSON.parse(data));
});


app.post('/api/xp/:userId', (req, res) => {
  const userId = req.params.userId;
  const { xp } = req.body;
  const data = JSON.parse(fs.readFileSync('./data/XP.json', 'utf-8'));
  data[userId] = xp;
  fs.writeFileSync('./data/XP.json', JSON.stringify(data, null, 2));
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`API du bot lancée sur http://localhost:${PORT}`);
});
