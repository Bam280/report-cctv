import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'dist')));

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'cctv_report',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// --- API ROUTES ---

// Get Incidents
app.get('/api/incidents', async (req, res) => {
  const { month, year } = req.query;
  try {
    let query = 'SELECT * FROM incidents';
    let params = [];

    if (month && year) {
      query += ' WHERE MONTH(incidentTime) = ? AND YEAR(incidentTime) = ?';
      params.push(parseInt(month) + 1); // JS Month is 0-11, SQL is 1-12
      params.push(year);
    }

    query += ' ORDER BY incidentTime DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching incidents:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create Incident
app.post('/api/incidents', async (req, res) => {
  const { incidentTime, device, ip, alertSource, status, reason, resolution, sn } = req.body;
  const id = uuidv4();
  try {
    await pool.query(
      'INSERT INTO incidents (id, incidentTime, device, ip, alertSource, status, reason, resolution, sn) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, incidentTime, device, ip, alertSource, status, reason, resolution, sn]
    );
    res.json({ id, ...req.body });
  } catch (err) {
    console.error('Error creating incident:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update Incident
app.put('/api/incidents/:id', async (req, res) => {
  const { incidentTime, device, ip, alertSource, status, reason, resolution, sn } = req.body;
  try {
    await pool.query(
      'UPDATE incidents SET incidentTime=?, device=?, ip=?, alertSource=?, status=?, reason=?, resolution=?, sn=? WHERE id=?',
      [incidentTime, device, ip, alertSource, status, reason, resolution, sn, req.params.id]
    );
    res.json({ id: req.params.id, ...req.body });
  } catch (err) {
    console.error('Error updating incident:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete Incident
app.delete('/api/incidents/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM incidents WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting incident:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get Devices
app.get('/api/devices', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM devices');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching devices:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create/Update Device
app.post('/api/devices', async (req, res) => {
  const { id, name, sn, model, ip } = req.body;
  const finalId = id || uuidv4();
  
  try {
      // Simple Upsert logic
      const [exists] = await pool.query('SELECT id FROM devices WHERE id = ?', [finalId]);
      if (exists.length > 0) {
          await pool.query(
              'UPDATE devices SET name=?, sn=?, model=?, ip=? WHERE id=?',
              [name, sn, model, ip, finalId]
          );
      } else {
          await pool.query(
              'INSERT INTO devices (id, name, sn, model, ip) VALUES (?, ?, ?, ?, ?)',
              [finalId, name, sn, model, ip]
          );
      }
    res.json({ id: finalId, ...req.body });
  } catch (err) {
    console.error('Error saving device:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/devices/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM devices WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      console.error('Error deleting device:', err);
      res.status(500).json({ error: err.message });
    }
});

app.post('/api/devices/sync', async (req, res) => {
    const { devices } = req.body;
    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        
        // We only insert if name does not exist
        for (const d of devices) {
            const [rows] = await connection.query('SELECT id FROM devices WHERE name = ?', [d.name]);
            if (rows.length === 0) {
                await connection.query(
                    'INSERT INTO devices (id, name, sn, model, ip) VALUES (?, ?, ?, ?, ?)',
                    [d.id, d.name, d.sn, d.model, d.ip]
                );
            }
        }
        
        await connection.commit();
        connection.release();
        res.json({ success: true });
    } catch (err) {
        console.error('Error syncing devices:', err);
        res.status(500).json({ error: err.message });
    }
});

// Fallback for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});