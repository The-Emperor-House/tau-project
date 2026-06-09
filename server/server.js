require('dotenv').config()

const app = require('./app')

const PORT = process.env.PORT || 3002

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
});