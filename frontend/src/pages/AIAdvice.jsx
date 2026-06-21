import { useState } from 'react';
import api from '../lib/api';

export default function AIAdvice() {
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  async function fetchAdvice() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/ai/advice');
      setAdvice(res.data.advice);
      setLoaded(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not fetch advice');
    } finally {
      setLoading(false);
    }
  }

  function parseAdvice(text) {
    return text
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[*\-•]\s*/, '').trim())
      .filter(line => line.length > 0);
  }

  const tips = advice ? parseAdvice(advice) : [];

  return (
    <div style={{ padding: '44px 52px', maxWidth: '720px' }}>

      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.6px', color: '#1C1917' }}>
          AI advice
        </h1>
        <p style={{ fontSize: '14px', color: '#7A716A', marginTop: '6px', lineHeight: 1.6 }}>
          Personalised pricing recommendations based on your current products and ingredient costs.
        </p>
      </div>

      {!loaded && !loading && (
        <div style={{
          border: '1.5px dashed #E5DFD3',
          borderRadius: '12px',
          padding: '48px 32px',
          textAlign: 'center',
          background: '#FDFAF6',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>✨</div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#1C1917', marginBottom: '6px' }}>
            Get pricing recommendations
          </div>
          <div style={{ fontSize: '13px', color: '#A89F92', marginBottom: '24px', lineHeight: 1.6 }}>
            AI will analyse your products, margins and ingredient costs
            and suggest specific actions to improve your profitability.
          </div>
          <button onClick={fetchAdvice} className="btn-orange" style={btnPrimaryStyle}>
            <i className="ti ti-sparkles" style={{ fontSize: '15px' }} />
            Generate advice
          </button>
        </div>
      )}

      {loading && (
        <div style={{
          border: '1px solid #E5DFD3',
          borderRadius: '12px',
          padding: '48px 32px',
          textAlign: 'center',
          background: '#FDFAF6',
        }}>
          <div style={{ fontSize: '28px', marginBottom: '12px' }}>🤔</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#D97234' }}>
            Analysing your business data...
          </div>
          <div style={{ fontSize: '12px', color: '#A89F92', marginTop: '6px' }}>
            This takes a few seconds
          </div>
        </div>
      )}

      {error && (
        <div style={{
          background: '#F7E8E8', color: '#A83232',
          padding: '12px 16px', borderRadius: '10px',
          fontSize: '13px', marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      {loaded && tips.length > 0 && (
        <>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E5DFD3',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{
                width: '28px', height: '28px',
                background: '#FDF0E6',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#D97234', fontSize: '15px',
              }}>
                <i className="ti ti-sparkles" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C1917' }}>
                  Pricing recommendations
                </div>
                <div style={{ fontSize: '11px', color: '#A89F92', marginTop: '1px' }}>
                  Based on your current data
                </div>
              </div>
              <button
                onClick={fetchAdvice}
                className="btn-ghost"
                style={{ ...btnGhostStyle, marginLeft: 'auto', fontSize: '11px', padding: '6px 12px' }}
              >
                <i className="ti ti-refresh" style={{ fontSize: '13px' }} />
                Refresh
              </button>
            </div>

            {tips.map((tip, i) => (
              <div key={i} style={{
                display: 'flex', gap: '12px',
                padding: '10px 0',
                borderBottom: i < tips.length - 1 ? '1px solid #E5DFD3' : 'none',
              }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: '#D97234', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700, flexShrink: 0, marginTop: '1px',
                }}>{i + 1}</div>
                <div style={{ fontSize: '13px', color: '#4A4540', lineHeight: 1.6 }}>
                  {tip}
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: '11px', color: '#A89F92', textAlign: 'center' }}>
            Advice is based on your current product costs and margins.
            Refresh anytime after uploading new receipts.
          </div>
        </>
      )}

      {loaded && tips.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#A89F92', fontSize: '13px' }}>
          Add some products and ingredients first to get meaningful advice.
        </div>
      )}

    </div>
  );
}

const btnPrimaryStyle = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '10px 18px', borderRadius: '10px', fontSize: '13px',
  fontWeight: 600, cursor: 'pointer', border: 'none',
  boxShadow: '0 2px 8px rgba(217,114,52,0.2)',
};

const btnGhostStyle = {
  display: 'inline-flex', alignItems: 'center', gap: '5px',
  padding: '7px 12px', borderRadius: '8px', fontSize: '12px',
  fontWeight: 600, cursor: 'pointer',
};