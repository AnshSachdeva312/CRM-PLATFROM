const express = require('express');
const cors = require('cors');
const authRoutes = require('./Routes/authRoutes');
const segmentRoutes = require('./Routes/segmentRoutes');
require('./Database/db');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  }));
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', segmentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});