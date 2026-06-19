import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { getInitials } from '../lib/format';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    async function fetchAll() {
      try {
        const [p, r, i] = await Promise.all([
          api.get('/products'),
          api.get('/receipts'),
          api.get('/ingredients'),
        ]);
        setProducts(p.data);
        setReceipts(r.data);
        setIngredients(i.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const belowThreshold = products.filter(p => p.is_below_threshold);
  const avgMargin = products.length
    ? (products.reduce((sum, p) => sum + parseFloat(p.margin_percent || 0), 0) / products.length).toFixed(0)
    : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = user.business_name || user.email?.split('@')[0] || 'there';

  function getMarginColor(margin, threshold) {
    if (margin < threshold) return '#C0392B';
    if (margin < threshold + 10) return '#B8860B';
    return '#1E6B45';
  }

  function getPillStyle(margin, threshold) {
    if (margin < threshold) return { background: '#F7E8E8', color: '#A83232' };
    if (margin < threshold + 10) return { background: '#F7EFDC', color: '#946012' };
    return { background: '#E2F2EA', color: '#1E6B45' };
  }

  function getPillLabel(margin, threshold) {
    if (margin < threshold) return 'Below threshold';
    if (margin < threshold + 10) return 'Watch this';
    return 'Healthy';
  }

  function getStatusStyle(status) {
    const map = {
      applied: { background: '#E2F2EA', color: '#1E6B45' },
      parsed: { background: '#F7EFDC', color: '#946012' },
      pending: { background: '#F7EFDC', color: '#946012' },
      error: { background: '#F7E8E8', color: '#A83232' },
    };
    return map[status] || map.pending;
  }

  const greetSub = belowThreshold.length > 0
    ? `${belowThreshold.length} product${belowThreshold.length > 1 ? 's' : ''} ${belowThreshold.length > 1 ? 'are' : 'is'} below your margin threshold — worth a quick look today.`
    : products.length === 0
    ? 'Add your ingredients and first product to get started.'
    : `All your products are sitting at healthy margins right now. Upload a fresh receipt anytime to keep your costs accurate.`;

  if (loading) return (
    <div style={{ padding: '40px', color: '#A89F92', fontSize: '14px' }}>Loading...</div>
  );

  return (
    <div style={{ padding: '44px 52px', maxWidth: '780px' }}>

      {/* Greeting */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '-0.8px', color: '#1C1917', lineHeight: 1.15 }}>
          {greeting}, {name}
        </h1>
        <p style={{ fontSize: '14.5px', color: '#7A716A', marginTop: '8px', lineHeight: 1.65, maxWidth: '480px' }}>
          {greetSub}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '48px' }}>
        <button
          onClick={() => navigate('/receipts')}
          className="btn-orange"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '10px 18px', borderRadius: '10px', fontSize: '13px',
            fontWeight: 600, cursor: 'pointer', border: 'none',
            boxShadow: '0 2px 8px rgba(217,114,52,0.25)',
          }}
        >
          <i className="ti ti-upload" style={{ fontSize: '14px' }} />
          Scan a receipt
        </button>
        <button
          onClick={() => navigate('/products')}
          className="btn-ghost"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '10px 18px', borderRadius: '10px', fontSize: '13px',
            fontWeight: 600, cursor: 'pointer', background: '#fff',
          }}
        >
          <i className="ti ti-plus" style={{ fontSize: '14px' }} />
          New product
        </button>
      </div>

      {/* Products */}
      {products.length > 0 && (
        <div style={{ marginBottom: '44px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#A89F92', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Products <span style={{ color: '#1C1917', fontWeight: 800 }}>· {avgMargin}% avg margin</span>
            </span>
            <span
              onClick={() => navigate('/products')}
              className="dash-link"
              style={{ fontSize: '12.5px', color: '#D97234', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              View all <i className="ti ti-arrow-right" style={{ fontSize: '12px' }} />
            </span>
          </div>

          <div style={{ height: '1px', background: '#E5DFD3' }} />

          {products.slice(0, 5).map(p => {
            const margin = parseFloat(p.margin_percent || 0);
            const threshold = parseFloat(p.margin_alert_threshold || 20);
            const color = getMarginColor(margin, threshold);
            return (
              <div key={p.id}>
                <div className="dash-row" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', borderRadius: '12px', cursor: 'pointer', margin: '0 -14px' }}
                  onClick={() => navigate('/products')}
                >
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: '#fff', border: '1px solid #E5DFD3',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: 700, color: '#7A716A', flexShrink: 0,
                  }}>{p.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#1C1917', letterSpacing: '-0.1px' }}>{p.name}</div>
                    <div style={{ fontSize: '12.5px', color: '#A89F92', marginTop: '2px' }}>
                      Selling at ₹{parseFloat(p.selling_price).toFixed(0)}
                    </div>
                  </div>
                  <div style={{ width: '88px', flexShrink: 0 }}>
                    <div style={{ height: '5px', background: '#E9E3D6', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(margin, 100)}%`, background: color, borderRadius: '3px' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color, width: '40px', textAlign: 'right', flexShrink: 0, letterSpacing: '-0.3px' }}>
                    {margin.toFixed(0)}%
                  </div>
                  <div style={{
                    fontSize: '11px', fontWeight: 700, padding: '3px 9px',
                    borderRadius: '20px', flexShrink: 0,
                    ...getPillStyle(margin, threshold)
                  }}>
                    {getPillLabel(margin, threshold)}
                  </div>
                </div>
                <div style={{ height: '1px', background: '#E5DFD3' }} />
              </div>
            );
          })}
        </div>
      )}

      {/* Receipts */}
      {receipts.length > 0 && (
        <div style={{ marginBottom: '44px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#A89F92', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Recent receipts
            </span>
            <span
              onClick={() => navigate('/receipts')}
              className="dash-link"
              style={{ fontSize: '12.5px', color: '#D97234', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              View all <i className="ti ti-arrow-right" style={{ fontSize: '12px' }} />
            </span>
          </div>

          <div style={{ height: '1px', background: '#E5DFD3' }} />

          {receipts.slice(0, 4).map(r => {
            const statusStyle = getStatusStyle(r.status);            
            return (
              <div key={r.id}>
                <div className="dash-row" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', borderRadius: '12px', cursor: 'pointer', margin: '0 -14px' }}
                  onClick={() => navigate('/receipts')}
                >
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: '#fff', border: '1px solid #E5DFD3',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 700, color: '#7A716A', flexShrink: 0,
                  }}>{r.store_name
                      ? getInitials(r.store_name)
                      : <i className="ti ti-receipt" />
                    }</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#1C1917', letterSpacing: '-0.1px' }}>
                      {r.store_name || 'Unknown store'}
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#A89F92', marginTop: '2px' }}>
                      {r.item_count} items · {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  {r.total_amount && (
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#1C1917', marginRight: '4px', letterSpacing: '-0.3px' }}>
                      ₹{parseFloat(r.total_amount).toFixed(0)}
                    </div>
                  )}
                  <div style={{
                    fontSize: '11px', fontWeight: 700, padding: '3px 9px',
                    borderRadius: '20px', flexShrink: 0, ...statusStyle,
                  }}>
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </div>
                </div>
                <div style={{ height: '1px', background: '#E5DFD3' }} />
              </div>
            );
          })}
        </div>
      )}

      {/* Ingredients */}
      {ingredients.length > 0 && (
        <div style={{ marginBottom: '44px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#A89F92', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Top ingredients by cost
            </span>
            <span
              onClick={() => navigate('/ingredients')}
              className="dash-link"
              style={{ fontSize: '12.5px', color: '#D97234', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              Manage <i className="ti ti-arrow-right" style={{ fontSize: '12px' }} />
            </span>
          </div>

          <div style={{ height: '1px', background: '#E5DFD3' }} />

          {[...ingredients]
            .sort((a, b) => b.current_unit_cost - a.current_unit_cost)
            .slice(0, 4)
            .map(ing => {
              const maxCost = Math.max(...ingredients.map(x => parseFloat(x.current_unit_cost)));
              const pct = maxCost > 0 ? (parseFloat(ing.current_unit_cost) / maxCost) * 100 : 0;
              const isLow = ing.stock_qty < ing.low_stock_threshold && ing.low_stock_threshold > 0;
              return (
                <div key={ing.id}>
                  <div className="dash-row" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', borderRadius: '12px', cursor: 'pointer', margin: '0 -14px' }}
                    onClick={() => navigate('/ingredients')}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#1C1917' }}>{ing.name}</div>
                      <div style={{ fontSize: '12.5px', color: '#A89F92', marginTop: '2px' }}>
                        ₹{parseFloat(ing.current_unit_cost).toFixed(4)} per {ing.unit}
                      </div>
                      <div style={{ height: '4px', background: '#E9E3D6', borderRadius: '3px', overflow: 'hidden', marginTop: '8px', width: '120px' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: '#D97234', borderRadius: '3px' }} />
                      </div>
                    </div>
                    {isLow && (
                      <div style={{ fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '20px', background: '#F7E8E8', color: '#A83232', flexShrink: 0 }}>
                        Low stock
                      </div>
                    )}
                    <div style={{ fontSize: '12.5px', color: '#A89F92', flexShrink: 0, fontWeight: 500 }}>
                      {ing.stock_qty} {ing.unit}
                    </div>
                  </div>
                  <div style={{ height: '1px', background: '#E5DFD3' }} />
                </div>
              );
            })}
        </div>
      )}

      {/* Empty state */}
      {products.length === 0 && ingredients.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: '36px', marginBottom: '14px' }}>🧁</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', marginBottom: '6px' }}>
            Nothing here yet
          </div>
          <div style={{ fontSize: '13.5px', color: '#A89F92', marginBottom: '24px' }}>
            Add your first ingredient to get started
          </div>
          <button
            onClick={() => navigate('/ingredients')}
            className="btn-orange"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '10px 20px', borderRadius: '10px', fontSize: '13px',
              fontWeight: 600, cursor: 'pointer', border: 'none',
              boxShadow: '0 2px 8px rgba(217,114,52,0.25)',
            }}
          >
            Add ingredient
          </button>
        </div>
      )}
    </div>
  );
}