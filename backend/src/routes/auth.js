import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import pool from '../db/index.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  business_name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

router.post('/register', async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const { email, password, business_name } = parsed.data;
    const password_hash = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, business_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, business_name`,
      [email, password_hash, business_name]
    );

    const user = rows[0];
    res.status(201).json({ token: signToken(user), user });

    // Trigger n8n onboarding sequence
    if (process.env.N8N_REGISTER_WEBHOOK) {
      fetch(process.env.N8N_REGISTER_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          business_name: user.business_name,
        }),
      }).catch(err => console.error('n8n onboarding webhook error:', err.message));
    }
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    next(err);
  }

  if (process.env.N8N_REGISTER_WEBHOOK) {
    fetch(process.env.N8N_REGISTER_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        business_name: user.business_name
      })
    }).catch(err => console.error('n8n onboarding webhook error:', err.message));
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const { email, password } = parsed.data;

    const { rows } = await pool.query(
      'SELECT id, email, password_hash, business_name FROM users WHERE email = $1',
      [email]
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { password_hash, ...safeUser } = user;
    res.json({ token: signToken(safeUser), user: safeUser });
  } catch (err) {
    next(err);
  }
});

export default router;
