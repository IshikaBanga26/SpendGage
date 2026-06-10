import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { parseReceiptWithAI } from '../services/ai.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();
router.use(requireAuth);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG and WEBP images are allowed'));
    }
    cb(null, true);
  },
});

// GET all receipts 
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*,
        (SELECT COUNT(*) FROM receipt_items ri WHERE ri.receipt_id = r.id) as item_count
       FROM receipts r
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// GET single receipt with items
router.get('/:id', async (req, res, next) => {
  try {
    const { rows: [receipt] } = await pool.query(
      'SELECT * FROM receipts WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!receipt) return res.status(404).json({ error: 'Receipt not found' });

    const { rows: items } = await pool.query(
      `SELECT ri.*, i.name as matched_name
       FROM receipt_items ri
       LEFT JOIN ingredients i ON i.id = ri.matched_ingredient_id
       WHERE ri.receipt_id = $1`,
      [req.params.id]
    );

    res.json({ ...receipt, items });
  } catch (err) { next(err); }
});

// POST upload and parse receipt  
router.post('/upload', (req, res, next) => {
  upload.single('receipt')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res, next) => {
  console.log('File received:', req.file);
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

  try {
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = req.file.mimetype;

    const { rows: [receipt] } = await pool.query(
      `INSERT INTO receipts (user_id, image_url, status)
       VALUES ($1, $2, 'pending') RETURNING *`,
      [req.user.id, `/uploads/${req.file.filename}`]
    );

    const parsed = await parseReceiptWithAI(base64Image, mimeType);

    if (process.env.N8N_RECEIPT_WEBHOOK) {
      fetch(process.env.N8N_RECEIPT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: req.user.email,
          store_name: parsed.store_name || 'Unknown Store',
          item_count: parsed.items.length,
          receipt_id: receipt.id
        })
      }).catch(err => console.error('n8n webhook error:', err.message));
    }

    await pool.query(
      `UPDATE receipts
       SET store_name = $1, purchase_date = $2, total_amount = $3,
           raw_ai_response = $4, status = 'parsed'
       WHERE id = $5`,
      [parsed.store_name, parsed.purchase_date, parsed.total_amount,
       JSON.stringify(parsed), receipt.id]
    );

    const { rows: userIngredients } = await pool.query(
      'SELECT id, name FROM ingredients WHERE user_id = $1',
      [req.user.id]
    );

    for (const item of parsed.items) {
      const matched = userIngredients.find(ing =>
        ing.name.toLowerCase().includes(item.item_name.toLowerCase()) ||
        item.item_name.toLowerCase().includes(ing.name.toLowerCase())
      );

      await pool.query(
        `INSERT INTO receipt_items
         (receipt_id, item_name, quantity, unit, total_price, unit_price, matched_ingredient_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [receipt.id, item.item_name, item.quantity, item.unit,
         item.total_price, item.unit_price, matched?.id || null]
      );
    }

    const { rows: items } = await pool.query(
      'SELECT * FROM receipt_items WHERE receipt_id = $1',
      [receipt.id]
    );

    res.status(201).json({ ...receipt, ...parsed, items, status: 'parsed' });
  } catch (err) {
    next(err);
  } finally {
    if (req.file?.path) fs.unlink(req.file.path, () => {});
  }
});

// POST apply receipt to inventory
router.post('/:id/apply', async (req, res, next) => {
  try {
    const { item_applications } = req.body;
    for (const app of item_applications) {
      // Update ingredient cost
      await pool.query(
        `UPDATE ingredients SET current_unit_cost = $1, updated_at = NOW()
         WHERE id = $2 AND user_id = $3`,
        [app.unit_price, app.ingredient_id, req.user.id]
      );

      await pool.query(
        `INSERT INTO ingredient_price_history (ingredient_id, unit_cost, source)
         VALUES ($1, $2, 'receipt')`,
        [app.ingredient_id, app.unit_price]
      );

      await pool.query(
        `UPDATE receipt_items SET is_applied = true
         WHERE id = $1`,
        [app.receipt_item_id]
      );
    }

    await pool.query(
      `UPDATE receipts SET status = 'applied' WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    res.json({ success: true, message: 'Costs updated and margins recalculated' });
  } catch (err) { next(err); }
});

export default router;