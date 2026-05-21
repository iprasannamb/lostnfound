const app = require('./app');
const dotenv = require('dotenv');
const { ensureSchema } = require('./config/ensureSchema');

dotenv.config();

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await ensureSchema();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
