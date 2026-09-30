import express from 'express';

const api = express();
const PORT = 3000;

api.use(express.json());

api.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

api.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

api.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});