/* eslint-disable react-hooks/static-components */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  const [loginHover, setLoginHover] = useState(false);

  const SectionHeading = ({ children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
      <div style={{ width: '8px', height: '26px', background: '#D97234', borderRadius: '3px' }} />
      <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.7px' }}>{children}</h2>
    </div>
  );

  return (
    <div style={{ background: '#F7F4EE', color: '#1C1917', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* NAV */}
      <div className="landing-nav" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 56px', maxWidth: '1100px', margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', background: '#D97234', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '17px', boxShadow: '0 2px 6px rgba(217,114,52,0.25)',
          }}>
            <i className="ti ti-currency-dollar" />
          </div>
          <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.4px' }}>SpendGage</span>
        </div>
        <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
          <span
            onClick={() => navigate('/login')}
            onMouseEnter={() => setLoginHover(true)}
            onMouseLeave={() => setLoginHover(false)}
            style={{
              fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
              color: loginHover ? '#1C1917' : '#7A716A',
              borderBottom: loginHover ? '1.5px solid #1C1917' : '1.5px solid transparent',
              paddingBottom: '2px', transition: 'all 0.15s',
            }}
          >Log in</span>
          <button onClick={() => navigate('/register')} className="btn-orange" style={{
            fontSize: '13.5px', fontWeight: 600, padding: '9px 18px',
            borderRadius: '9px', border: 'none', cursor: 'pointer',
          }}>Sign up</button>
        </div>
      </div>

      {/* HERO - two column */}
      <div className="landing-hero" style={{
        maxWidth: '1100px', margin: '0 auto', padding: '32px 56px 80px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '56px', alignItems: 'center',
      }}>
        {/* Left - text */}
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', fontWeight: 700, color: '#946012', background: '#F7EFDC',
            padding: '6px 14px', borderRadius: '20px', marginBottom: '22px',
          }}>
            Built for indie creators &amp; home bakers
          </div>

          <h1 className="landing-h1" style={{
            fontSize: '42px', fontWeight: 800, letterSpacing: '-1.5px',
            lineHeight: 1.12,
          }}>
            Stop guessing if your <span style={{ color: '#D97234' }}>prices</span> still make you money
          </h1>

          <p style={{ fontSize: '15.5px', color: '#7A716A', lineHeight: 1.75, marginTop: '22px', maxWidth: '460px' }}>
            Ingredient costs creep up every month — but your prices don't. SpendGage scans
            your grocery receipts, tracks real costs, and tells you the moment a product's
            margin gets too thin.
          </p>

          <button onClick={() => navigate('/register')} className="btn-orange" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            fontSize: '14px', fontWeight: 700, padding: '12px 24px',
            borderRadius: '10px', border: 'none', cursor: 'pointer',
            marginTop: '28px',
          }}>
            Get started free <i className="ti ti-arrow-right" />
          </button>

          <div style={{ fontSize: '12.5px', color: '#A89F92', marginTop: '14px' }}>
            No credit card needed · Set up in under 5 minutes
          </div>
        </div>

        {/* Right - screenshot with background shape */}
        <div className="landing-hero-visual" style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', top: '-28px', right: '-24px',
            width: '92%', height: '92%',
            background: '#FBE3CC', borderRadius: '24px',
            transform: 'rotate(-2.5deg)', zIndex: 0,
          }} />

          <div style={{
            position: 'relative', border: '1px solid #E5DFD3', borderRadius: '16px',
            overflow: 'hidden', boxShadow: '0 16px 48px rgba(28,25,23,0.08)',
            display: 'flex', background: '#fff', zIndex: 1,
          }}>
            {/* sidebar sliver */}
            <div style={{ width: '52px', background: '#1C1917', padding: '18px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
              <div style={{ width: '22px', height: '22px', background: '#D97234', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px' }}>
                <i className="ti ti-currency-dollar" />
              </div>
              {['ti-home', 'ti-receipt', 'ti-basket', 'ti-box', 'ti-sparkles'].map((icon, i) => (
                <div key={i} style={{
                  width: '28px', height: '28px', borderRadius: '7px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: i === 0 ? '#2A2520' : 'transparent',
                  color: i === 0 ? '#E8A87C' : '#5C5850', fontSize: '13px',
                }}>
                  <i className={`ti ${icon}`} />
                </div>
              ))}
            </div>

            {/* content */}
            <div style={{ flex: 1, background: '#F7F4EE', padding: '24px 26px' }}>
              <div style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.4px', marginBottom: '3px' }}>Good morning, Ishika</div>
              <div style={{ fontSize: '11.5px', color: '#7A716A', marginBottom: '18px', lineHeight: 1.5 }}>2 products are below your margin threshold.</div>

              <div style={{ fontSize: '10px', fontWeight: 700, color: '#A89F92', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                Products
              </div>
              <div style={{ height: '1px', background: '#E5DFD3' }} />

              {[
                { name: 'Chocolate Truffle Box', price: 350, margin: 11, color: '#C0392B', pill: { bg: '#F7E8E8', c: '#A83232', label: 'Low' }, letter: 'C' },
                { name: 'Butter Cookie Pack', price: 180, margin: 18, color: '#B8860B', pill: { bg: '#F7EFDC', c: '#946012', label: 'Watch' }, letter: 'B' },
                { name: 'Birthday Cake', price: 800, margin: 84, color: '#1E6B45', pill: { bg: '#E2F2EA', c: '#1E6B45', label: 'Healthy' }, letter: 'C' },
              ].map((item, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '8px', background: '#fff',
                      border: '1px solid #E5DFD3', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700, color: '#7A716A', flexShrink: 0,
                    }}>{item.letter}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: '10.5px', color: '#A89F92', marginTop: '1px' }}>₹{item.price}</div>
                    </div>
                    <div style={{ width: '46px', height: '4px', background: '#E9E3D6', borderRadius: '3px', overflow: 'hidden', flexShrink: 0 }}>
                      <div style={{ height: '100%', width: `${item.margin}%`, background: item.color, borderRadius: '3px' }} />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 800, width: '30px', textAlign: 'right', color: item.color, flexShrink: 0 }}>{item.margin}%</div>
                    <div style={{ fontSize: '9.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '20px', background: item.pill.bg, color: item.pill.c, flexShrink: 0 }}>
                      {item.pill.label}
                    </div>
                  </div>
                  <div style={{ height: '1px', background: '#E5DFD3' }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: '12.5px', color: '#D97234', fontWeight: 600, marginTop: '14px', textAlign: 'right' }}>
            Updated the moment a receipt is scanned
          </div>
        </div>
      </div>

      {/* THE PROBLEM - visual stat panels */}
      <div className="landing-section" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 56px 88px' }}>
        <SectionHeading>The problem</SectionHeading>

        <p style={{ fontSize: '15px', color: '#7A716A', lineHeight: 1.75, marginBottom: '36px', maxWidth: '640px' }}>
          Same product. Same recipe. Same price tag. But ingredient costs don't stay
          still — and most creators have no way of knowing when their margins quietly
          disappear underneath them.
        </p>

        <div className="landing-problem-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ background: '#FBEAEA', border: '1px solid #F3D4D4', borderRadius: '16px', padding: '28px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#A83232', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
              Without tracking
            </div>
            <div style={{ fontSize: '46px', fontWeight: 800, color: '#A83232', letterSpacing: '-1.5px', lineHeight: 1 }}>11%</div>
            <div style={{ fontSize: '13px', color: '#B07070', marginTop: '4px', marginBottom: '16px' }}>margin, six months later</div>
            <p style={{ fontSize: '14px', color: '#8a5a5a', lineHeight: 1.65 }}>
              Butter quietly rose from ₹50 to ₹80 per 100g. The Chocolate Truffle Box
              still sold at ₹350 — barely covering costs, and nobody noticed.
            </p>
          </div>

          <div style={{ background: '#E8F5EE', border: '1px solid #CDE9DB', borderRadius: '16px', padding: '28px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E6B45', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
              With SpendGage
            </div>
            <div style={{ fontSize: '46px', fontWeight: 800, color: '#1E6B45', letterSpacing: '-1.5px', lineHeight: 1 }}>25%</div>
            <div style={{ fontSize: '13px', color: '#6FA088', marginTop: '4px', marginBottom: '16px' }}>margin, maintained</div>
            <p style={{ fontSize: '14px', color: '#4d7a64', lineHeight: 1.65 }}>
              The price change was scanned the same week butter went up. An email
              suggested raising the price to ₹420 — done in two minutes.
            </p>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="landing-section" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 56px 88px' }}>
        <SectionHeading>How it works</SectionHeading>

        {[
          {
            num: '01', title: 'Upload a receipt',
            desc: 'Take a photo of any grocery or supply bill — the messier the better, SpendGage reads it anyway.',
          },
          {
            num: '02', title: 'AI reads every line',
            desc: 'Items, quantities, and prices are extracted automatically and matched to your existing ingredients.',
          },
          {
            num: '03', title: 'Margins recalculate themselves',
            desc: 'Every product using that ingredient updates instantly — no spreadsheets, no manual math.',
          },
          {
            num: '04', title: 'You get the alert before it hurts',
            desc: 'If a margin drops below your safe threshold, an email lands in your inbox with a specific suggestion.',
          },
        ].map((step, i) => (
          <div key={i} style={{
            display: 'flex', gap: '32px', alignItems: 'flex-start',
            padding: '28px 0', borderTop: i > 0 ? '1px solid #E5DFD3' : 'none',
          }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#E8A87C', flexShrink: 0, width: '40px' }}>
              {step.num}
            </div>
            <div style={{ flex: 1, maxWidth: '480px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{step.title}</h3>
              <p style={{ fontSize: '14px', color: '#7A716A', lineHeight: 1.7 }}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA - centered */}
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 24px 100px', textAlign: 'center' }}>
        <div style={{ borderTop: '1px solid #E5DFD3', paddingTop: '56px' }}>
          <h2 style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '-0.8px', lineHeight: 1.25 }}>
            Stop finding out about price changes <span style={{ color: '#D97234' }}>the hard way</span>.
          </h2>
          <p style={{ fontSize: '15px', color: '#7A716A', marginTop: '14px', lineHeight: 1.7 }}>
            Free to start. Takes about 5 minutes to set up your first ingredients and product.
          </p>
          <div style={{ marginTop: '28px' }}>
            <button onClick={() => navigate('/register')} className="btn-orange" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              fontSize: '14px', fontWeight: 700, padding: '12px 26px',
              borderRadius: '10px', border: 'none', cursor: 'pointer',
            }}>
              Get started free <i className="ti ti-arrow-right" />
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER - centered */}
      <div style={{
        maxWidth: '1100px', margin: '0 auto', padding: '28px 24px',
        borderTop: '1px solid #E5DFD3', textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{
            width: '22px', height: '22px', background: '#D97234', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px',
          }}>
            <i className="ti ti-currency-dollar" />
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700 }}>SpendGage</span>
        </div>
        <div style={{ fontSize: '12.5px', color: '#A89F92' }}>
          Built by{' '}
          <a href="https://github.com/IshikaBanga26" style={{ color: '#D97234', textDecoration: 'none', fontWeight: 600 }}>
            Ishika Banga
          </a>
          {' '}· © 2026
        </div>
      </div>

    </div>
  );
}