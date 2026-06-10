import { Router } from 'express';
import { z } from 'zod';
import pool from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const IngredientSchema = z.object({
  name: z.string().min(1),
  unit: z.string().min(1),
  current_unit_cost: z.number().min(0),
  stock_qty: z.number().min(0).optional().default(0),
  low_stock_threshold: z.number().min(0).optional().default(0),
});

// GET all ingredients
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM ingredients WHERE user_id = $1 ORDER BY name ASC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// POST create ingredient
router.post('/', async (req, res, next) => {
  try {
    const data = IngredientSchema.parse(req.body);
    const { rows } = await pool.query(
      `INSERT INTO ingredients (user_id, name, unit, current_unit_cost, stock_qty, low_stock_threshold)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, data.name, data.unit, data.current_unit_cost, data.stock_qty, data.low_stock_threshold]
    );

    // Log first price to history
    await pool.query(
      `INSERT INTO ingredient_price_history (ingredient_id, unit_cost, source)
       VALUES ($1, $2, 'manual')`,
      [rows[0].id, data.current_unit_cost]
    );

    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PATCH update ingredient
router.patch('/:id', async (req, res, next) => {
  try {
    const data = IngredientSchema.partial().parse(req.body);
    const fields = Object.keys(data);
    const values = Object.values(data);
    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const { rows } = await pool.query(
      `UPDATE ingredients SET ${setClause}, updated_at = NOW()
       WHERE id = $${fields.length + 1} AND user_id = $${fields.length + 2}
       RETURNING *`,
      [...values, req.params.id, req.user.id]
    );

    if (!rows[0]) return res.status(404).json({ error: 'Ingredient not found' });

    // Log price change to history
    if (data.current_unit_cost !== undefined) {
      await pool.query(
        `INSERT INTO ingredient_price_history (ingredient_id, unit_cost, source)
         VALUES ($1, $2, 'manual')`,
        [rows[0].id, data.current_unit_cost]
      );
    }

    res.json(rows[0]);
  } catch (err) { next(err); }
});

// DELETE ingredient
router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query(
      'DELETE FROM ingredients WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

// GET price history
router.get('/:id/history', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM ingredient_price_history
       WHERE ingredient_id = $1 ORDER BY recorded_at DESC LIMIT 30`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

export default router;