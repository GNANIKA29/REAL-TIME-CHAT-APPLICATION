import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

// Initialize LowDB
const __dirname = dirname(fileURLToPath(import.meta.url));
const dbFile = join(__dirname, 'db.json');
const adapter = new JSONFile(dbFile); // Use JSONFile directly
const db = new Low(adapter);

async function initDB() {
  await db.read();
  db.data = db.data || { users: [], messages: [] };
  if (!db.data.users) db.data.users = [];
  if (!db.data.messages) db.data.messages = [];
  await db.write();
}
initDB();

// Setup Express app
const app = express();
app.use(cors());
app.use(express.json());

// Default route for GET /
app.get('/', (req, res) => {
  res.send('Chatterly backend is running.');
});

// Get all messages
app.get('/api/messages', async (req, res) => {
  await db.read();
  res.json(db.data.messages || []);
});

// Search messages
app.get('/api/search', async (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  await db.read();
  const results = (db.data.messages || []).filter(m => m.text && m.text.toLowerCase().includes(q));
  res.json(results);
});

// Login route
app.post('/api/login', async (req, res) => {
  const { username } = req.body;
  if (!username || typeof username !== 'string' || !username.trim()) {
    return res.status(400).json({ error: 'Username required' });
  }
  await db.read();
  let user = db.data.users.find(u => u.username === username);
  if (!user) {
    user = { id: Date.now(), username };
    db.data.users.push(user);
    await db.write();
  }
  res.json(user);
});

// Setup server
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

// Socket.io events
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // Send message history
  db.read().then(() => {
    socket.emit('history', db.data.messages || []);
  });

  // Create message
  socket.on('message:create', async (msg) => {
  const message = { ...msg, id: Date.now(), timestamp: new Date().toISOString() };
    await db.read();
    db.data.messages.push(message);
    await db.write();
    io.emit('message:create', message);
  });

  // Edit message
  socket.on('message:edit', async ({ id, text }) => {
    await db.read();
    const m = db.data.messages.find(x => x.id === id);
    if (m && !m.deleted) {
      m.text = text;
      await db.write();
      io.emit('message:edit', m);
    }
  });

  // Delete message
  socket.on('message:delete', async ({ id }) => {
    await db.read();
    const m = db.data.messages.find(x => x.id === id);
    if (m && !m.deleted) {
      m.deleted = true;
      await db.write();
      io.emit('message:delete', { id });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
