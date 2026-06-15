import { useState, useEffect } from 'react';
import api from '../lib/api';

const emptyForm = {
  name: '',
  selling_price: '',
  margin_alert_threshold: '20',
  notes: '',
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [recipe, setRecipe] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [expandedData, setExpandedData] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      const [p, i] = await Promise.all([
        api.get('/products'),
        api.get('/ingredients'),
      ]);
      setProducts(p.data);
      setIngredients(i.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleExpand(product) {
    if (expandedId === product.id) {
      setExpandedId(null);
      setExpandedData(null);
      return;
    }
    try {
      const res = await api.get(`/products/${product.id}`);
      setExpandedId(product.id);
      setExpandedData(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  function openAdd() {
    setForm(emptyForm);
    setRecipe([]);
    setEditingId(null);
    setError('');
    setShowForm(true);
  }

  async function openEdit(product) {
    setError('');
    setEditingId(product.id);
    setForm({
      name: product.name,
      selling_price: product.selling_price,
      margin_alert_threshold: product.margin_alert_threshold,
      notes: product.notes || '',
    });
    try {
      const res = await api.get(`/products/${product.id}`);
      setRecipe(res.data.recipe.map(r => ({
        ingredient_id: r.ingredient_id,
        quantity_used: r.quantity_used,
      })));
    } catch (err) {
      setRecipe([]);
    }
    setShowForm(true);
  }

  function addRecipeRow() {
    setRecipe(prev => [...prev, { ingredient_id: '', quantity_used: '' }]);
  }

  function updateRecipeRow(index, field, value) {
    setRecipe(prev => prev.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    ));
  }

  function removeRecipeRow(index) {
    setRecipe(prev => prev.filter((_, i) => i !== index));
  }

  function calcMaterialCost() {
    return recipe.reduce((sum, row) => {
      const ing = ingredients.find(i => i.id === row.ingredient_id);
      if (!ing || !row.quantity_used) return sum;
      return sum + (parseFloat(ing.current_unit_cost) * parseFloat(row.quantity_used));
    }, 0);
  }

  function calcMargin() {
    const cost = calcMaterialCost();
    const price = parseFloat(form.selling_price || 0);
    if (!price) return 0;
    return ((price - cost) / price * 100);
  }

  async function handleSave() {
    if (!form.name || !form.selling_price) {
      setError('Name and selling price are required');
      return;
    }
    const validRecipe = recipe.filter(r => r.ingredient_id && r.quantity_used);
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        selling_price: parseFloat(form.selling_price),
        margin_alert_threshold: parseFloat(form.margin_alert_threshold || 20),
        notes: form.notes,
        recipe: validRecipe.map(r => ({
          ingredient_id: r.ingredient_id,
          quantity_used: parseFloat(r.quantity_used),
        })),
      };
      if (editingId) {
        await api.patch(`/products/${editingId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      await fetchAll();
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Could not delete');
    }
  }

  function getMarginColor(margin, threshold) {
    if (margin < threshold) return '#C0392B';
    if (margin < threshold + 10) return '#B8860B';
    return '#1E6B45';
  }

  const liveMargin = calcMargin();
  const liveCost = calcMaterialCost();

  return (
    <div style={{ padding: '44px 52px', maxWidth: '780px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.6px', color: '#1C1917' }}>
            Products
          </h1>
          <p style={{ fontSize: '14px', color: '#7A716A', marginTop: '6px' }}>
            {products.length} product{products.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <button onClick={openAdd} className="btn-orange" style={btnPrimaryStyle}>
          <i className="ti ti-plus" style={{ fontSize: '15px' }} />
          Add product
        </button>
      </div>

      {/* Loading */}
      {loading && <p style={{ color: '#A89F92', fontSize: '14px' }}>Loading...</p>}

      {/* Empty state */}
      {!loading && products.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎂</div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#1C1917', marginBottom: '6px' }}>
            No products yet
          </div>
          <div style={{ fontSize: '13px', color: '#A89F92', marginBottom: '20px' }}>
            Add a product and build its recipe from your ingredients
          </div>
          <button onClick={openAdd} className="btn-orange" style={btnPrimaryStyle}>Add first product</button>
        </div>
      )}

      {/* Product list */}
      {products.map((p) => {
        const margin = parseFloat(p.margin_percent || 0);
        const threshold = parseFloat(p.margin_alert_threshold || 20);
        const color = getMarginColor(margin, threshold);
        const isExpanded = expandedId === p.id;

        return (
          <div key={p.id}>
            {/* Product row */}
            <div className="dash-row" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', borderRadius: '12px', cursor: 'pointer', margin: '0 -14px' }}
              onClick={() => toggleExpand(p)}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: '#fff', border: '1px solid #E5DFD3',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: 700, color: '#7A716A', flexShrink: 0,
              }}>{p.name.charAt(0).toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14.5px', fontWeight: 600, color: '#1C1917' }}>{p.name}</span>
                  {p.is_below_threshold && <span style={pillRed}>Below threshold</span>}
                </div>
                <div style={{ fontSize: '12.5px', color: '#A89F92', marginTop: '3px' }}>
                  Selling at ₹{parseFloat(p.selling_price).toFixed(0)} · Cost ₹{parseFloat(p.total_material_cost || 0).toFixed(2)}
                </div>
              </div>
              <div style={{ width: '80px', flexShrink: 0 }}>
                <div style={{ height: '5px', background: '#E9E3D6', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(margin, 100)}%`, background: color, borderRadius: '3px' }} />
                </div>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color, width: '40px', textAlign: 'right', flexShrink: 0 }}>
                {margin.toFixed(0)}%
              </div>
              <i className={`ti ${isExpanded ? 'ti-chevron-up' : 'ti-chevron-down'}`}
                style={{ fontSize: '14px', color: '#A89F92', flexShrink: 0 }} />
            </div>
            <div style={{ height: '1px', background: '#E5DFD3' }} />

            {/* Expanded recipe */}
            {isExpanded && expandedData && (
              <div style={{ padding: '16px 0' }}>
                {expandedData.recipe?.length > 0 ? (
                  <div style={{ background: '#FFFFFF', border: '1px solid #E5DFD3', borderRadius: '10px', padding: '14px 16px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#A89F92', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>
                      Recipe
                    </div>
                    {expandedData.recipe.map(r => (
                      <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '5px 0', borderBottom: '1px solid #E5DFD3' }}>
                        <span style={{ color: '#1C1917', fontWeight: 500 }}>{r.ingredient_name}</span>
                        <span style={{ color: '#7A716A' }}>{r.quantity_used} {r.unit} · ₹{parseFloat(r.line_cost).toFixed(2)}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, paddingTop: '8px', color: '#1C1917' }}>
                      <span>Total material cost</span>
                      <span>₹{parseFloat(expandedData.total_material_cost).toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: '#A89F92', paddingBottom: '8px' }}>No recipe added yet.</p>
                )}
                {expandedData.notes && (
                  <p style={{ fontSize: '13px', color: '#7A716A', marginBottom: '10px' }}>{expandedData.notes}</p>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={(e) => { e.stopPropagation(); openEdit(p); }} className="btn-ghost" style={btnGhostStyle}>
                    <i className="ti ti-pencil" style={{ fontSize: '14px' }} /> Edit
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="btn-ghost-red" style={btnGhostStyle}>
                    <i className="ti ti-trash" style={{ fontSize: '14px' }} /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Modal */}
      {showForm && (
        <div style={overlayStyle} onClick={() => setShowForm(false)}>
          <div style={{ ...modalStyle, width: '520px' }} onClick={e => e.stopPropagation()}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917' }}>
                {editingId ? 'Edit product' : 'Add product'}
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
              <label style={labelStyle}>Product name</label>
              <input style={inputStyle} placeholder="e.g. Custom Birthday Cake"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Selling price (₹)</label>
                <input style={inputStyle} type="number" placeholder="0"
                  value={form.selling_price} onChange={e => setForm({ ...form, selling_price: e.target.value })} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Alert below margin (%)</label>
                <input style={inputStyle} type="number" placeholder="20"
                  value={form.margin_alert_threshold} onChange={e => setForm({ ...form, margin_alert_threshold: e.target.value })} />
              </div>
            </div>

            {/* Live margin preview */}
            {form.selling_price && recipe.some(r => r.ingredient_id) && (
              <div style={{ background: '#FFFFFF', border: '1px solid #E5DFD3', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#A89F92', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Live preview</div>
                  <div style={{ fontSize: '13px', color: '#7A716A', marginTop: '3px' }}>Material cost: ₹{liveCost.toFixed(2)}</div>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: getMarginColor(liveMargin, parseFloat(form.margin_alert_threshold || 20)) }}>
                  {liveMargin.toFixed(1)}%
                </div>
              </div>
            )}

            {/* Recipe builder */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <label style={labelStyle}>Recipe ingredients</label>
                <button onClick={addRecipeRow} className="btn-ghost" style={{ ...btnGhostStyle, fontSize: '11px', padding: '4px 10px' }}>
                  <i className="ti ti-plus" style={{ fontSize: '12px' }} /> Add ingredient
                </button>
              </div>

              {ingredients.length === 0 && (
                <p style={{ fontSize: '12px', color: '#A89F92' }}>Add ingredients first before building a recipe.</p>
              )}

              {recipe.map((row, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 32px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <select style={inputStyle} value={row.ingredient_id}
                    onChange={e => updateRecipeRow(idx, 'ingredient_id', e.target.value)}>
                    <option value="">Select ingredient</option>
                    {ingredients.map(ing => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} (₹{parseFloat(ing.current_unit_cost).toFixed(4)}/{ing.unit})
                      </option>
                    ))}
                  </select>
                  <input style={inputStyle} type="number" placeholder="Qty"
                    value={row.quantity_used}
                    onChange={e => updateRecipeRow(idx, 'quantity_used', e.target.value)} />
                  <button onClick={() => removeRecipeRow(idx)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A89F92', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="ti ti-x" />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Notes (optional)</label>
              <input style={inputStyle} placeholder="Any notes about this product"
                value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleSave} disabled={saving} className="btn-orange" style={{ ...btnPrimaryStyle, flex: 1, justifyContent: 'center' }}>
                {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add product'}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-ghost" style={btnGhostStyle}>Cancel</button>
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
  maxWidth: '90vw', border: '1px solid #E5DFD3',
  maxHeight: '90vh', overflowY: 'auto',
};