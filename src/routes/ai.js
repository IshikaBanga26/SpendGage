import { Router } from 'express';
import pool from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { getMarginAdvice } from '../services/ai.js';

const router = Router();
router.use(requireAuth);

router.get('/advice', async (req, res, next) => {
  try {
    const { rows: products } = await pool.query(
      `SELECT *,
        CASE WHEN margin_percent < margin_alert_threshold
        THEN true ELSE false END as is_below_threshold
       FROM products WHERE user_id = $1`,
      [req.user.id]
    );

    const { rows: ingredients } = await pool.query(
      'SELECT * FROM ingredients WHERE user_id = $1',
      [req.user.id]
    );

    if (!products.length) {
      return res.json({ advice: 'Add some products first to get pricing advice.' });
    }

    const advice = await getMarginAdvice(products, ingredients);
    res.json({ advice });
  } catch (err) { next(err); }
});

export default router;