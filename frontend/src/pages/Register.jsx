import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', business_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#FDF8F3',
    }}>
      <div style={{
        background: '#FDFAF6', border: '1px solid #E8DDD0',
        borderRadius: '16px', padding: '36px',
        width: '100%', maxWidth: '400px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '28px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: '#D97234',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '17px', color: '#fff',
            boxShadow: '0 2px 6px rgba(217,114,52,0.25)',
          }}>
            <i className="ti ti-currency-dollar" />
          </div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917' }}>SpendGage</span>
        </div>

        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1A1916', marginBottom: '4px' }}>
          Create your account
        </h1>
        <p style={{ fontSize: '13px', color: '#7A7770', marginBottom: '24px' }}>
          Start tracking your ingredient costs and margins
        </p>

        {error && (
          <div style={{
            background: '#FBEAEA', color: '#B83232',
            padding: '10px 12px', borderRadius: '8px',
            fontSize: '13px', marginBottom: '16px',
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Business name</label>
            <input
              style={inputStyle}
              placeholder="e.g. Ishika's Bakery"
              value={form.business_name}
              onChange={e => setForm({ ...form, business_name: e.target.value })}
              required
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Email</label>
            <input
              style={inputStyle}
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Password</label>
            <input
              style={inputStyle}
              type="password"
              placeholder="Min 8 characters"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '10px', borderRadius: '8px',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              border: 'none', background: '#E07B39', color: '#fff',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={{ fontSize: '13px', color: '#7A7770', marginTop: '16px', textAlign: 'center' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#E07B39', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', border: '1px solid #E8DDD0', borderRadius: '8px',
  padding: '9px 12px', fontSize: '13px', background: '#FDFAF6',
  color: '#1A1916', outline: 'none',
};

const labelStyle = {
  display: 'block', fontSize: '11px', fontWeight: 700,
  color: '#B0ADA6', textTransform: 'uppercase',
  letterSpacing: '0.07em', marginBottom: '6px',
};