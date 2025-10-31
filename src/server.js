// Mini serveur web pour le healthcheck
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'OnlyFans AI DM Bot',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`🌐  Serveur healthcheck démarré sur le port ${PORT}`);
});

