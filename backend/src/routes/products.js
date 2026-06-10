import { Router } from 'express';
import { z } from 'zod';
import pool from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const ProductSchema = z.object({
  name: z.string().min(1),
  selling_price: z.number().min(0),
  margin_alert_threshold: z.number().min(0).max(100).optional().default(20),
  notes: z.string().optional(),
});

const RecipeItemSchema = z.object({
  ingredient_id: z.string().uuid(),
  quantity_used: z.number().min(0),
});

// GET all products
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT *,
        CASE WHEN margin_percent < margin_alert_threshold
        THEN true ELSE false END as is_below_threshold
       FROM products WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// GET single product with full recipe
router.get('/:id', async (req, res, next) => {
  try {
    const { rows: [product] } = await pool.query(
      `SELECT *,
        CASE WHEN margin_percent < margin_alert_threshold
        THEN true ELSE false END as is_below_threshold
       FROM products WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const { rows: recipe } = await pool.query(
      `SELECT ri.*, i.name as ingredient_name, i.unit,
              i.current_unit_cost,
              (ri.quantity_used * i.current_unit_cost) as line_cost
       FROM recipe_items ri
       JOIN ingredients i ON i.id = ri.ingredient_id
       WHERE ri.product_id = $1`,
      [req.params.id]
    );

    res.json({ ...product, recipe });
  } catch (err) { next(err); }
});

// POST create product
router.post('/', async (req, res, next) => {
  try {
    const { recipe, ...productData } = req.body;
    const data = ProductSchema.parse(productData);

    const { rows } = await pool.query(
      `INSERT INTO products (user_id, name, selling_price, margin_alert_threshold, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, data.name, data.selling_price, data.margin_alert_threshold, data.notes]
    );
    const product = rows[0];

    // Add recipe items if provided
    if (recipe?.length) {
      const items = z.array(RecipeItemSchema).parse(recipe);
      for (const item of items) {
        await pool.query(
          `INSERT INTO recipe_items (product_id, ingredient_id, quantity_used)
           VALUES ($1, $2, $3)`,
          [product.id, item.ingredient_id, item.quantity_used]
        );
      }
      // Recalculate margin using DB function
      await pool.query('SELECT recalculate_product_cost($1)', [product.id]);
    }

    const { rows: [fresh] } = await pool.query(
      'SELECT * FROM products WHERE id = $1', [product.id]
    );
    res.status(201).json(fresh);
  } catch (err) { next(err); }
});

// PATCH update product
router.patch('/:id', async (req, res, next) => {
  try {
    const { recipe, ...productData } = req.body;
    const data = ProductSchema.partial().parse(productData);
    const fields = Object.keys(data);

    if (fields.length) {
      const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
      await pool.query(
        `UPDATE products SET ${setClause}, updated_at = NOW()
         WHERE id = $${fields.length + 1} AND user_id = $${fields.length + 2}`,
        [...Object.values(data), req.params.id, req.user.id]
      );
    }

    if (recipe !== undefined) {
      await pool.query('DELETE FROM recipe_items WHERE product_id = $1', [req.params.id]);
      const items = z.array(RecipeItemSchema).parse(recipe);
      for (const item of items) {
        await pool.query(
          `INSERT INTO recipe_items (product_id, ingredient_id, quantity_used)
           VALUES ($1, $2, $3)`,
          [req.params.id, item.ingredient_id, item.quantity_used]
        );
      }
      await pool.query('SELECT recalculate_product_cost($1)', [req.params.id]);
    }

    const { rows: [fresh] } = await pool.query(
      'SELECT * FROM products WHERE id = $1', [req.params.id]
    );
    res.json(fresh);
  } catch (err) { next(err); }
});

// DELETE product
router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query(
      'DELETE FROM products WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;