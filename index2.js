const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse incoming JSON
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is working!');
});

// Handle POST request to /location
app.post('/location', (req, res) => {
  const { latitude, longitude } = req.body;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ error: 'Latitude and longitude must be numbers' });
  }

  console.log(`Received location: Latitude = ${latitude}, Longitude = ${longitude}`);

  // Append the location to the JSON file
  const newLocation = {
    latitude,
    longitude,
    timestamp: new Date().toISOString()
  };

  const filePath = path.join(__dirname, 'locations.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    let locations = [];

    if (!err && data) {
      try {
        locations = JSON.parse(data);
      } catch (e) {
        console.error('Error parsing existing file, starting fresh.');
      }
    }

    locations.push(newLocation);

    fs.writeFile(filePath, JSON.stringify(locations, null, 2), (err) => {
      if (err) {
        console.error('Failed to write to file:', err);
        return res.status(500).json({ error: 'Failed to save location' });
      }

      res.status(200).json({ message: 'Location stored successfully' });
    });
  });
});

// **Add this GET /locations endpoint:**
app.get('/locations', (req, res) => {
  const filePath = path.join(__dirname, 'locations.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File doesn't exist yet → return empty array
        return res.json([]);
      }
      return res.status(500).json({ error: 'Failed to read locations' });
    }
    try {
      const locations = JSON.parse(data);
      res.json(locations);
    } catch {
      res.status(500).json({ error: 'Corrupted locations data' });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
