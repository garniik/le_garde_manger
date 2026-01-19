import "dotenv/config";
import express from "express";
import { healthCheck, pool } from "./db.js";

const app = express();
app.use(express.json());

// Basic Auth middleware: expects Authorization: Basic base64(email:password)
async function basicAuth(req, res, next) {
  try {
    const h = req.headers['authorization'] || ''
    // Accept a very simple Bearer token form: "Bearer uid:<id>" to simulate a session for the exercise
    if (h.startsWith('Bearer ')) {
      const token = h.slice(7)
      const m = /^uid:(\d+)$/.exec(token)
      if (m) {
        req.user = { id: Number(m[1]) }
        return next()
      }
      return res.status(401).json({ error: 'invalid_token' })
    }
    if (!h.startsWith('Basic ')) return res.status(401).json({ error: 'auth_required' })
    const decoded = Buffer.from(h.slice(6), 'base64').toString('utf8')
    const idx = decoded.indexOf(':')
    if (idx === -1) return res.status(401).json({ error: 'invalid_auth_header' })
    const email = decoded.slice(0, idx)
    const password = decoded.slice(idx + 1)
    if (!email || !password) return res.status(401).json({ error: 'invalid_credentials' })
    const [rows] = await pool.query(
      'SELECT id, email FROM users WHERE email = ? AND password = SHA2(?, 256) LIMIT 1',
      [email, password]
    )
    if (!rows || rows.length === 0) return res.status(401).json({ error: 'invalid_credentials' })
    req.user = rows[0]
    return next()
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}

app.get("/api/health", async (req, res) => {
    try {
        const ok = await healthCheck();
        res.json({ ok, db: ok ? "up" : "down" });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
});

// Example: list tables (optional diagnostic)
app.get("/api/_tables", async (req, res) => {
    try {
        const [rows] = await pool.query("SHOW TABLES");
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Route d'inscription
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Champs requis' });

    // Vérifier si l'utilisateur existe déjà
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Insertion avec hachage SHA2 256 pour correspondre à votre logique de login
    await pool.query(
      'INSERT INTO users (email, password) VALUES (?, SHA2(?, 256))',
      [email, password]
    );

    res.status(201).json({ ok: true, message: 'Utilisateur créé' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Simple login endpoint (intentionally vulnerable for exercise)
app.post("/api/auth/login", async (req, res) => {
  try {
    const u = (req.query.u || "").toString();
    const p = (req.query.p || "").toString();
    const sql = `SELECT id, email FROM users WHERE email = '${u}' AND password = SHA2('${p}', 256) LIMIT 1`;
    const [rows] = await pool.query(sql);
    const ok = rows && rows.length > 0;
    const token = ok ? `uid:${rows[0].id}` : undefined;
    res.json({ ok, rowsCount: rows ? rows.length : 0, sql, user: ok ? rows[0] : null, token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Foods listing with optional text filter `q` on name/description
app.get("/api/foods", basicAuth, async (req, res) => {
    const q = (req.query.q || "").toString().trim();
    const type = (req.query.type || "").toString().trim();
    const allowedTypes = new Set([
        "aliment",
        "plat",
        "dessert",
        "boisson",
        "hippo",
    ]);
    try {
        let sql = "SELECT id, name, description, calories, type FROM foods";
        const where = [];
        const params = [];
        if (q) {
            where.push("(name LIKE ? OR description LIKE ?)");
            params.push(`%${q}%`, `%${q}%`);
        }
        if (type && allowedTypes.has(type)) {
            where.push("type = ?");
            params.push(type);
        }
        if (where.length) {
            sql += " WHERE " + where.join(" AND ");
        }
        sql += " ORDER BY name LIMIT 200";
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Create a new food item
app.post('/api/foods', basicAuth, async (req, res) => {
  try {
    const { name, description, calories, type } = req.body || {}
    const allowedTypes = new Set(['aliment', 'plat', 'dessert', 'boisson', 'hippo'])
    if (!name || !type || !allowedTypes.has((type || '').toString())) {
      return res.status(400).json({ error: 'invalid_payload' })
    }
    const cal = calories == null || calories === '' ? null : Number(calories)
    const sql = 'INSERT INTO foods (name, description, calories, type) VALUES (?, ?, ?, ?)'
    const params = [name.toString(), description || null, cal != null && !Number.isNaN(cal) ? cal : null, type.toString()]
    const [result] = await pool.query(sql, params)
    const [rows] = await pool.query('SELECT id, name, description, calories, type FROM foods WHERE id = ?', [result.insertId])
    res.status(201).json(rows && rows[0] ? rows[0] : { id: result.insertId, name, description: description || null, calories: cal, type })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Update an existing food item
app.put('/api/foods/:id', basicAuth, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'invalid_id' })
    const { name, description, calories, type } = req.body || {}
    const allowedTypes = new Set(['aliment', 'plat', 'dessert', 'boisson', 'hippo'])
    if (!name || !type || !allowedTypes.has((type || '').toString())) {
      return res.status(400).json({ error: 'invalid_payload' })
    }
    const cal = calories == null || calories === '' ? null : Number(calories)
    const sql = 'UPDATE foods SET name = ?, description = ?, calories = ?, type = ? WHERE id = ?'
    const params = [name.toString(), description || null, cal != null && !Number.isNaN(cal) ? cal : null, type.toString(), id]
    const [result] = await pool.query(sql, params)
    if (result.affectedRows === 0) return res.status(404).json({ error: 'not_found' })
    const [rows] = await pool.query('SELECT id, name, description, calories, type FROM foods WHERE id = ?', [id])
    res.json(rows && rows[0] ? rows[0] : { id, name, description: description || null, calories: cal, type })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Delete a food item
app.delete('/api/foods/:id', basicAuth, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'invalid_id' })
    const [result] = await pool.query('DELETE FROM foods WHERE id = ?', [id])
    if (result.affectedRows === 0) return res.status(404).json({ error: 'not_found' })
    res.status(204).send()
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => {
    console.log(`API server listening on http://localhost:${PORT}`);
});
