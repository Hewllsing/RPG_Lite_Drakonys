const express = require('express');
const cors = require('cors');
require('dotenv').config();

const characterRoutes = require('./routes/characterRoutes');
const monsterRoutes = require('./routes/monsterRoutes');
const combatRoutes = require('./routes/combatRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/character', characterRoutes);
app.use('/api/monsters', monsterRoutes);
app.use('/api/combat', combatRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});