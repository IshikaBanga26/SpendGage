import { Router } from 'express';
import pool from '../db/index.js';

const router = Router();

function InternalKey(req, res, next) {
  const key = req.headers['x-internal-key'];
  if (key !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

router.get('/low-margin-products', InternalKey, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.name as product_name,
        p.selling_price,
        p.total_material_cost,
        p.margin_percent,
        p.margin_alert_threshold,
        u.email as user_email,
        u.business_name
      FROM products p
      JOIN users u ON u.id = p.user_id
      WHERE p.margin_percent < p.margin_alert_threshold
      ORDER BY p.margin_percent ASC
    `);
    res.json({ products: rows, count: rows.length });
  } catch (err) { next(err); }
});

router.get('/low-stock-ingredients', InternalKey, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        i.name,
        i.stock_qty,
        i.low_stock_threshold,
        i.unit,
        u.email as user_email,
        u.business_name
      FROM ingredients i
      JOIN users u ON u.id = i.user_id
      WHERE i.stock_qty < i.low_stock_threshold
      AND i.low_stock_threshold > 0
      ORDER BY i.stock_qty ASC
    `);
    res.json({ ingredients: rows, count: rows.length });
  } catch (err) { next(err); }
});

export default router;