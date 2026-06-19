import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import { getInitials } from '../lib/format';

export default function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [expandedData, setExpandedData] = useState(null);
  const [applyingId, setApplyingId] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [matchMap, setMatchMap] = useState({});
  const fileRef = useRef();

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      const [r, i] = await Promise.all([
        api.get('/receipts'),
        api.get('/ingredients'),
      ]);
      setReceipts(r.data);
      setIngredients(i.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(file) {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('receipt', file);
      const res = await api.post('/receipts/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setReceipts(prev => [res.data, ...prev]);
      setExpandedId(res.data.id);
      setExpandedData(res.data);
      const map = {};
      res.data.items?.forEach(item => {
        if (item.matched_ingredient_id) map[item.id] = item.matched_ingredient_id;
      });
      setMatchMap(map);
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function toggleExpand(receipt) {
    if (expandedId === receipt.id) {
      setExpandedId(null);
      setExpandedData(null);
      return;
    }
    try {
      const res = await api.get(`/receipts/${receipt.id}`);
      setExpandedId(receipt.id);
      setExpandedData(res.data);
      const map = {};
      res.data.items?.forEach(item => {
        if (item.matched_ingredient_id) map[item.id] = item.matched_ingredient_id;
      });
      setMatchMap(map);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleApply(receiptId) {
    const items = expandedData?.items || [];
    const applications = items
      .filter(item => matchMap[item.id])
      .map(item => {
        const matchValue = matchMap[item.id];
        const isNew = matchValue.startsWith('new_');
        return {
          receipt_item_id: item.id,
          ingredient_id: isNew ? null : matchValue,
          is_new: isNew,
          item_name: item.item_name,
          unit: item.unit,
          unit_price: parseFloat(item.unit_price),
        };
      });

    if (!applications.length) {
      alert('Match at least one item before applying.');
      return;
    }

    setApplyingId(receiptId);
    try {
      await api.post(`/receipts/${receiptId}/apply`, {
        item_applications: applications,
      });
      await fetchAll();
      setExpandedId(null);
      setExpandedData(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Apply failed');
    } finally {
      setApplyingId(null);
    }
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

  return (
    <div style={{ padding: '44px 52px', maxWidth: '780px' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.6px', color: '#1C1917' }}>
          Receipts
        </h1>
        <p style={{ fontSize: '14px', color: '#7A716A', marginTop: '6px' }}>
          Upload grocery bills — AI extracts costs automatically
        </p>
      </div>

      {/* Upload zone */}
      <div
        onClick={() => !uploading && fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleUpload(file);
        }}
        style={{
          border: '1.5px dashed #E5DFD3',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          marginBottom: '28px',
          background: uploading ? '#FDF0E6' : '#FDFAF6',
          transition: 'all 0.15s',
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={e => handleUpload(e.target.files[0])}
        />
        {uploading ? (
          <>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>⏳</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#D97234' }}>
              AI is reading your receipt...
            </div>
            <div style={{ fontSize: '12px', color: '#A89F92', marginTop: '4px' }}>
              This takes a few seconds
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📄</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1C1917' }}>
              Drop a receipt image here
            </div>
            <div style={{ fontSize: '12px', color: '#A89F92', marginTop: '4px' }}>
              or click to browse · JPG, PNG, WEBP up to 10MB
            </div>
          </>
        )}
      </div>

      {/* Loading */}
      {loading && <p style={{ color: '#A89F92', fontSize: '14px' }}>Loading...</p>}

      {/* Empty state */}
      {!loading && receipts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '13px', color: '#A89F92' }}>
            No receipts yet — upload your first grocery bill above
          </div>
        </div>
      )}

      {/* Receipts list */}
      {receipts.map((r) => {
        const statusStyle = getStatusStyle(r.status);
        const isExpanded = expandedId === r.id;

        return (
          <div key={r.id}>
            {/* Receipt row */}
            <div className="dash-row"
              style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', borderRadius: '12px', cursor: 'pointer', margin: '0 -14px' }}
              onClick={() => toggleExpand(r)}
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
                <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#1C1917' }}>
                  {r.store_name || 'Unknown store'}
                </div>
                <div style={{ fontSize: '12.5px', color: '#A89F92', marginTop: '2px' }}>
                  {r.item_count} items
                  {r.total_amount && ` · ₹${parseFloat(r.total_amount).toFixed(0)}`}
                  {' · '}{new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>

              <div style={{
                fontSize: '11px', fontWeight: 700, padding: '3px 9px',
                borderRadius: '20px', flexShrink: 0, ...statusStyle,
              }}>
                {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
              </div>

              <i className={`ti ${isExpanded ? 'ti-chevron-up' : 'ti-chevron-down'}`}
                style={{ fontSize: '14px', color: '#A89F92', flexShrink: 0 }} />
            </div>
            <div style={{ height: '1px', background: '#E5DFD3' }} />

            {/* Expanded items */}
            {isExpanded && expandedData && (
              <div style={{ padding: '16px 0' }}>
                <div style={{ background: '#FFFFFF', border: '1px solid #E5DFD3', borderRadius: '10px', padding: '14px 16px', marginBottom: '12px' }}>

                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#A89F92', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px' }}>
                    Extracted items — match to your ingredients
                  </div>

                  {expandedData.items?.map(item => (
                    <div key={item.id} style={{
                      display: 'grid', gridTemplateColumns: '1fr 80px 1fr',
                      gap: '10px', alignItems: 'center',
                      padding: '8px 0', borderBottom: '1px solid #E5DFD3',
                    }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917' }}>{item.item_name}</div>
                        <div style={{ fontSize: '11px', color: '#A89F92', marginTop: '1px' }}>
                          {item.quantity} {item.unit} · ₹{parseFloat(item.unit_price || 0).toFixed(4)}/unit
                        </div>
                      </div>

                      <div style={{ textAlign: 'center', color: '#A89F92', fontSize: '16px' }}>→</div>

                      {r.status === 'applied' ? (
                        <div style={{ fontSize: '12px', color: '#1E6B45', fontWeight: 600 }}>
                          {item.matched_name || 'Applied'}
                        </div>
                      ) : (
                        <select
                          style={{ ...inputStyle, fontSize: '12px', padding: '6px 10px' }}
                          value={matchMap[item.id] || ''}
                          onChange={e => setMatchMap(prev => ({ ...prev, [item.id]: e.target.value }))}
                        >
                          <option value="">Skip this item</option>
                          <option value={`new_${item.id}`}>Add as new ingredient</option>
                          {ingredients.map(ing => (
                            <option key={ing.id} value={ing.id}>{ing.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>

                {r.status !== 'applied' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleApply(r.id)}
                      disabled={applyingId === r.id}
                      className="btn-green"
                      style={{ ...btnPrimaryStyle, flex: 1, justifyContent: 'center' }}
                    >
                      <i className="ti ti-check" style={{ fontSize: '14px' }} />
                      {applyingId === r.id ? 'Applying...' : 'Apply to inventory'}
                    </button>
                    <button onClick={() => { setExpandedId(null); setExpandedData(null); }} className="btn-ghost" style={btnGhostStyle}>
                      Cancel
                    </button>
                  </div>
                )}

                {r.status === 'applied' && (
                  <div style={{ fontSize: '13px', color: '#1E6B45', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="ti ti-circle-check" style={{ fontSize: '16px' }} />
                    Costs applied — product margins have been recalculated
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const btnPrimaryStyle = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '9px 16px', borderRadius: '10px', fontSize: '13px',
  fontWeight: 600, cursor: 'pointer', border: 'none',
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