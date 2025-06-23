const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 8080;

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, 'dist/<your-project-name>')));

// Serve index.html on any unknown route (for Angular routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/<your-project-name>/index.html'));
});

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
