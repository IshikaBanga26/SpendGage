import { useState, useEffect } from 'react';
import api from '../lib/api';

const UNITS = ['g', 'kg', 'ml', 'l', 'piece', 'pack', 'bottle', 'bag', 'box'];

const emptyForm = {
  name: '',
  unit: 'g',
  current_unit_cost: '',
  stock_qty: '',
  low_stock_threshold: '',
};

export default function Ingredients() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchIngredients(); }, []);

  async function fetchIngredients() {
    try {
      const res = await api.get('/ingredients');
      setIngredients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
    setShowForm(true);
  }

  function openEdit(ing) {
    setForm({
      name: ing.name,
      unit: ing.unit,
      current_unit_cost: ing.current_unit_cost,
      stock_qty: ing.stock_qty,
      low_stock_threshold: ing.low_stock_threshold,
    });
    setEditingId(ing.id);
    setError('');
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name || !form.current_unit_cost) {
      setError('Name and unit cost are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        unit: form.unit,
        current_unit_cost: parseFloat(form.current_unit_cost),
        stock_qty: parseFloat(form.stock_qty || 0),
        low_stock_threshold: parseFloat(form.low_stock_threshold || 0),
      };
      if (editingId) {
        await api.patch(`/ingredients/${editingId}`, payload);
      } else {
        await api.post('/ingredients', payload);
      }
      await fetchIngredients();
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this ingredient? This cannot be undone.')) return;
    try {
      await api.delete(`/ingredients/${id}`);
      setIngredients(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Could not delete');
    }
  }

  const filtered = ingredients.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '44px 52px', maxWidth: '780px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.6px', color: '#1C1917' }}>
            Ingredients
          </h1>
          <p style={{ fontSize: '14px', color: '#7A716A', marginTop: '6px' }}>
            {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <button onClick={openAdd} className="btn-orange" style={btnPrimaryStyle}>
          <i className="ti ti-plus" style={{ fontSize: '15px' }} />
          Add ingredient
        </button>
      </div>

      {/* Hint */}
      {ingredients.length === 0 && !loading && (
        <div style={{
          background: '#FDF0E6',
          border: '1px solid #F4C9A8',
          borderRadius: '10px',
          padding: '12px 16px',
          fontSize: '13px',
          color: '#7A4A1E',
          marginBottom: '20px',
          lineHeight: 1.5,
        }}>
          <strong>Tip:</strong> The fastest way to add ingredients is uploading a grocery receipt — AI extracts everything automatically. Use the form below for items you bought without a receipt.
        </div>
      )}

      {/* Search */}
      {ingredients.length > 0 && (
        <input
          placeholder="Search ingredients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, marginBottom: '20px' }}
        />
      )}

      {/* Loading */}
      {loading && <p style={{ color: '#A89F92', fontSize: '14px' }}>Loading...</p>}

      {/* Empty state */}
      {!loading && ingredients.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🥣</div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#1C1917', marginBottom: '6px' }}>
            No ingredients yet
          </div>
          <div style={{ fontSize: '13px', color: '#A89F92', marginBottom: '20px' }}>
            Add your raw materials to start tracking costs
          </div>
          <button onClick={openAdd} className="btn-orange" style={btnPrimaryStyle}>Add first ingredient</button>
        </div>
      )}

      {/* List */}
      {filtered.map((ing, i) => {
        const isLow = ing.low_stock_threshold > 0 && ing.stock_qty < ing.low_stock_threshold;
        return (
          <div key={ing.id}>
            <div className="dash-row" style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '14px', borderRadius: '12px', margin: '0 -14px',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14.5px', fontWeight: 600, color: '#1C1917' }}>{ing.name}</span>
                  {isLow && <span style={pillRed}>Low stock</span>}
                </div>
                <div style={{ fontSize: '12.5px', color: '#A89F92', marginTop: '3px' }}>
                  ₹{parseFloat(ing.current_unit_cost).toFixed(4)} per {ing.unit}
                  {ing.stock_qty > 0 && ` · ${ing.stock_qty} ${ing.unit} in stock`}
                </div>
              </div>
              <button onClick={() => openEdit(ing)} className="btn-ghost" style={btnGhostStyle}>
                <i className="ti ti-pencil" style={{ fontSize: '14px' }} />
                Edit
              </button>
              <button onClick={() => handleDelete(ing.id)} className="btn-ghost-red" style={btnGhostStyle}>
                <i className="ti ti-trash" style={{ fontSize: '14px' }} />
              </button>
            </div>
            <div style={{ height: '1px', background: '#E5DFD3' }} />
          </div>
        );
      })}

      {/* No search results */}
      {!loading && ingredients.length > 0 && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#A89F92', fontSize: '13px' }}>
          No ingredients match "{search}"
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div style={overlayStyle} onClick={() => setShowForm(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917' }}>
                {editingId ? 'Edit ingredient' : 'Add ingredient'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A89F92', fontSize: '18px' }}>
                <i className="ti ti-x" />
              </button>
            </div>

            {error && (
              <div style={{ background: '#F7E8E8', color: '#A83232', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Name</label>
              <input
                style={inputStyle}
                placeholder="e.g. All-purpose flour"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Unit</label>
                <select style={inputStyle} value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Cost per unit (₹)</label>
                <input style={inputStyle} type="number" step="0.0001" placeholder="0.0000"
                  value={form.current_unit_cost} onChange={e => setForm({ ...form, current_unit_cost: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Stock quantity</label>
                <input style={inputStyle} type="number" placeholder="0"
                  value={form.stock_qty} onChange={e => setForm({ ...form, stock_qty: e.target.value })} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Low stock alert at</label>
                <input style={inputStyle} type="number" placeholder="0"
                  value={form.low_stock_threshold} onChange={e => setForm({ ...form, low_stock_threshold: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button onClick={handleSave} disabled={saving} className="btn-orange" style={{ ...btnPrimaryStyle, flex: 1, justifyContent: 'center' }}>
                {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add ingredient'}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-ghost" style={btnGhostStyle}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const btnPrimaryStyle = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '9px 16px', borderRadius: '10px', fontSize: '13px',
  fontWeight: 600, cursor: 'pointer', border: 'none',
  boxShadow: '0 2px 8px rgba(217,114,52,0.2)',
};

const btnGhostStyle = {
  display: 'inline-flex', alignItems: 'center', gap: '5px',
  padding: '8px 12px', borderRadius: '8px', fontSize: '12px',
  fontWeight: 600, cursor: 'pointer',
};

const inputStyle = {
  width: '100%', border: '1px solid #E5DFD3', borderRadius: '8px',
  padding: '9px 12px', fontSize: '13px', background: '#FDFAF6',
  color: '#1C1917', outline: 'none',
};

const labelStyle = {
  display: 'block', fontSize: '11px', fontWeight: 700, color: '#A89F92',
  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px',
};

const pillRed = {
  fontSize: '10px', fontWeight: 700, padding: '2px 7px',
  borderRadius: '20px', background: '#F7E8E8', color: '#A83232',
};

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
};

const modalStyle = {
  background: '#FDFAF6', borderRadius: '14px', padding: '24px',
  width: '440px', maxWidth: '90vw', border: '1px solid #E5DFD3',
};