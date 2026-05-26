require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Bot ishga tushadi (polling)
require('./bot');

app.use('/api/groups', require('./routes/groups'));
app.use('/api/students', require('./routes/students'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server ishlamoqda: http://localhost:${PORT}`);
  console.log(`Mini App URL: ${process.env.MINI_APP_URL}`);
});
