import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', icon: 'ti-home', label: 'Home' },
  { to: '/receipts', icon: 'ti-receipt', label: 'Receipts' },
  { to: '/ingredients', icon: 'ti-basket', label: 'Ingredients' },
  { to: '/products', icon: 'ti-box', label: 'Products' },
  { to: '/advice', icon: 'ti-sparkles', label: 'AI advice' },
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  const initials = user.email?.slice(0, 2).toUpperCase() || 'SG';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F7F4EE' }}>

      {/* MOBILE TOP BAR - only visible on small screens */}
      <div className="mobile-topbar" style={{
        display: 'none',
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
        background: '#1C1917', padding: '14px 16px',
        alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{
            width: '28px', height: '28px', background: '#D97234', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '15px',
          }}>
            <i className="ti ti-currency-dollar" />
          </div>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#F5F0E8' }}>SpendGage</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: 'none', border: 'none', color: '#F5F0E8', fontSize: '22px', cursor: 'pointer' }}
        >
          <i className={mobileMenuOpen ? 'ti ti-x' : 'ti ti-menu-2'} />
        </button>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {mobileMenuOpen && (
        <div className="mobile-dropdown" style={{
          display: 'none',
          position: 'fixed', top: '56px', left: 0, right: 0, zIndex: 39,
          background: '#1C1917', padding: '8px 12px 16px',
        }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 12px', borderRadius: '9px',
                fontSize: '14px', fontWeight: 500,
                textDecoration: 'none',
                background: isActive ? '#2A2520' : 'transparent',
                color: isActive ? '#E8A87C' : '#8A8580',
              })}
            >
              <i className={`ti ${item.icon}`} style={{ fontSize: '17px', width: '18px' }} />
              {item.label}
            </NavLink>
          ))}
          <div style={{ height: '1px', background: '#2A2520', margin: '8px 0' }} />
          <div
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 12px', cursor: 'pointer', color: '#8A8580', fontSize: '14px' }}
          >
            <i className="ti ti-logout" style={{ fontSize: '17px', width: '18px' }} />
            Sign out
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="desktop-sidebar" style={{
        width: '212px',
        background: '#1C1917',
        display: 'flex',
        flexDirection: 'column',
        padding: '22px 12px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '0 8px', marginBottom: '32px' }}>
          <div style={{
            width: '30px', height: '30px', background: '#D97234', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '16px', boxShadow: '0 2px 6px rgba(217,114,52,0.25)',
          }}>
            <i className="ti ti-currency-dollar" />
          </div>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#F5F0E8', letterSpacing: '-0.3px' }}>
            SpendGage
          </span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 11px', borderRadius: '9px',
                fontSize: '13px', fontWeight: 500,
                textDecoration: 'none', transition: 'all 0.14s',
                background: isActive ? '#2A2520' : 'transparent',
                color: isActive ? '#E8A87C' : '#8A8580',
              })}
              onMouseEnter={e => {
                const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
                if (!isActive) {
                  e.currentTarget.style.background = '#2A2520';
                  e.currentTarget.style.color = '#D4C9B8';
                }
              }}
              onMouseLeave={e => {
                const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#8A8580';
                }
              }}
            >
              <i className={`ti ${item.icon}`} style={{ fontSize: '16px', width: '17px', flexShrink: 0 }} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        
        <div style={{ height: '1px', background: '#2A2520', margin: '8px 0' }} />

        <div
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 11px', borderRadius: '9px', cursor: 'pointer',
            transition: 'background 0.14s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#2A2520'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #2D8659, #1E6B45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#D4C9B8' }}>
              {user.business_name || user.email?.split('@')[0] || 'My Business'}
            </div>
            <div style={{ fontSize: '11px', color: '#5C5850', marginTop: '1px' }}>Sign out</div>
          </div>
          <i className="ti ti-logout" style={{ fontSize: '15px', color: '#5C5850', flexShrink: 0 }} />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content" style={{ flex: 1, overflow: 'auto', background: '#F7F4EE' }}>
        {children}
      </main>

      {/* MOBILE BOTTOM TAB BAR */}
      <nav className="mobile-bottom-nav" style={{
        display: 'none',
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        background: '#1C1917', padding: '8px 4px',
        justifyContent: 'space-around', alignItems: 'center',
      }}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              padding: '4px 8px', borderRadius: '8px',
              textDecoration: 'none',
              color: isActive ? '#E8A87C' : '#8A8580',
            })}
          >
            <i className={`ti ${item.icon}`} style={{ fontSize: '19px' }} />
            <span style={{ fontSize: '10px', fontWeight: 600 }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}