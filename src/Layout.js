import React, { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Badge, Form } from "react-bootstrap";
import { clearSession, fetchJson, canManageUsers } from "./api";

function Layout() {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [globalResults, setGlobalResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [theme, setTheme] = useState(() => localStorage.getItem("eklavya-theme") || "default");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const commandInputRef = useRef(null);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  // A4: Silently re-validate role from server on app load
  useEffect(() => {
    fetchJson('/auth/profile/').then(serverProfile => {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.role !== serverProfile.role) {
            localStorage.setItem('user', JSON.stringify({ ...parsed, role: serverProfile.role }));
          }
        } catch { }
      }
    }).catch(() => { });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("eklavya-theme", theme);
  }, [theme]);

  const loadNotifications = async () => {
    try {
      const data = await fetchJson('/notifications/');
      setUnreadCount(Array.isArray(data) ? data.filter(n => !n.is_read).length : 0);
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  };

  const pages = [
    { name: "Dashboard", path: "dashboard", icon: "📊" },
    { name: "Students", path: "students", icon: "🎓" },
    { name: "Teachers", path: "teachers", icon: "👩‍🏫" },
    { name: "Timetable", path: "timetable", icon: "📅" },
    { name: "Fees", path: "fees", icon: "💰" },
    { name: "Reports", path: "reports", icon: "📈" },
    { name: "Branches", path: "branches", icon: "🏢" },
    { name: "Users", path: "users", icon: "👥" },
    { name: "Notifications", path: "notifications", icon: "🔔" },
    { name: "Profile", path: "profile", icon: "👤" },
  ];

  const themeOptions = [
    { value: "default", label: "Modern Azure", icon: "💎" },
    { value: "midnight", label: "Midnight Pro", icon: "🌑" },
    { value: "lavender", label: "Royal Velvet", icon: "🔮" },
    { value: "sunset", label: "Crimson Sunset", icon: "🌅" },
    { value: "emerald", label: "Emerald Forest", icon: "🌿" },
    { value: "cyberpunk", label: "Cyberpunk Neon", icon: "⚡" },
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (showCommandPalette) commandInputRef.current?.focus();
  }, [showCommandPalette]);

  useEffect(() => {
    if (!searchQuery.trim()) { setGlobalResults([]); return; }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await fetchJson(`/search/?q=${encodeURIComponent(searchQuery)}`);
        setGlobalResults(data.results || []);
      } catch (e) { console.error("Search failed", e); }
      finally { setIsSearching(false); }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => { loadNotifications(); }, []);

  const handleLogout = () => {
    clearSession();
    window.location.href = "/";
  };

  const filteredPages = pages.filter(page =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Hamburger SVG icon
  const HamburgerIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );

  const CloseIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <div className="d-flex align-items-center gap-2 mb-4 px-2">
          <div style={{ width: 30, height: 30, background: 'var(--primary-gradient)', borderRadius: '8px' }}></div>
          <h2 className="fs-5 m-0 gradient-text" style={{ fontWeight: 800 }}>Eklavya</h2>
        </div>

        <nav className="flex-grow-1">
          {pages.map((page) => {
            if (page.name === 'Users' && !canManageUsers()) return null;
            return (
              <NavLink
                key={page.path}
                to={page.path}
                className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
              >
                <span style={{ fontSize: '1.1rem' }}>{page.icon}</span>
                {page.name}
                {page.name === "Notifications" && unreadCount > 0 && (
                  <Badge bg="danger" pill className="ms-auto" style={{ fontSize: '0.65rem' }}>{unreadCount}</Badge>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <Form.Select
            size="sm"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="mb-3 rounded-pill px-3 fw-bold"
            style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.8rem' }}
          >
            {themeOptions.map(t => (
              <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
            ))}
          </Form.Select>
          <button className="sidebar-logout" onClick={handleLogout}>
            <span style={{ fontSize: '1.1rem' }}>🚪</span>
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Header with Hamburger */}
      <header className="app-navbar d-flex d-lg-none align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <button
            className="hamburger-btn"
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-label="Menu"
          >
            {drawerOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>
          <h2 className="fs-6 m-0 gradient-text" style={{ fontWeight: 800 }}>Eklavya</h2>
        </div>
        <div className="d-flex align-items-center gap-3">
          <button className="hamburger-btn" onClick={() => setShowCommandPalette(true)} aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <NavLink to="notifications" className="position-relative" style={{ color: 'var(--text)' }}>
            🔔 {unreadCount > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.55rem' }}>{unreadCount}</span>}
          </NavLink>
        </div>
      </header>

      {/* Mobile Slide-Out Drawer */}
      {drawerOpen && <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} />}
      <div className={`mobile-drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="d-flex align-items-center gap-2 mb-4">
          <div style={{ width: 28, height: 28, background: 'var(--primary-gradient)', borderRadius: '8px' }}></div>
          <h2 className="fs-6 m-0 gradient-text" style={{ fontWeight: 800 }}>Eklavya</h2>
        </div>

        <nav className="drawer-nav">
          {pages.map((page) => {
            if (page.name === 'Users' && !canManageUsers()) return null;
            return (
              <NavLink
                key={page.path}
                to={page.path}
                className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
                onClick={() => setDrawerOpen(false)}
              >
                <span style={{ fontSize: '1.1rem' }}>{page.icon}</span>
                {page.name}
                {page.name === "Notifications" && unreadCount > 0 && (
                  <Badge bg="danger" pill className="ms-auto" style={{ fontSize: '0.65rem' }}>{unreadCount}</Badge>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="filter-label mb-2">Theme</p>
          <div className="theme-picker">
            {themeOptions.map(t => (
              <button
                key={t.value}
                className={`theme-chip ${theme === t.value ? 'active' : ''}`}
                onClick={() => setTheme(t.value)}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
          <button
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <span style={{ fontSize: '1.1rem' }}>🚪</span>
            Sign out
          </button>
        </div>
      </div>

      <main className="main-content">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-bottom-nav d-lg-none">
        {pages.slice(0, 5).map((page) => (
          <NavLink
            key={page.path}
            to={page.path}
            className={({ isActive }) => isActive ? "bottom-nav-item active" : "bottom-nav-item"}
          >
            <span className="bnav-icon">{page.icon}</span>
            <span>{page.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Command Palette Modal */}
      {showCommandPalette && (
        <div className="command-palette-overlay" onClick={() => setShowCommandPalette(false)}>
          <div className="command-palette" onClick={e => e.stopPropagation()}>
            <div className="command-input-wrapper">
              <span className="fs-4">🔍</span>
              <input
                ref={commandInputRef}
                type="text"
                placeholder="Search pages, students, records..."
                className="command-input"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Badge bg="none" className="border text-muted" style={{ fontSize: '0.6rem' }}>ESC</Badge>
            </div>

            <div className="command-results">
              {filteredPages.length > 0 && (
                <div className="px-3 py-2 text-muted small fw-bold">PAGES</div>
              )}
              {filteredPages.map(page => (
                <div
                  key={page.path}
                  className="result-item"
                  onClick={() => {
                    navigate(page.path);
                    setShowCommandPalette(false);
                    setSearchQuery("");
                  }}
                >
                  <span className="fs-5">{page.icon}</span>
                  <span>{page.name}</span>
                </div>
              ))}

              {isSearching && <div className="p-4 text-center">Searching...</div>}

              {!isSearching && globalResults.length > 0 && (
                <div className="px-3 py-2 text-muted small fw-bold mt-2">DATA</div>
              )}
              {!isSearching && globalResults.map(result => (
                <div
                  key={result.id}
                  className="result-item"
                  onClick={() => {
                    navigate(result.path);
                    setShowCommandPalette(false);
                    setSearchQuery("");
                  }}
                >
                  <span className="fs-5">{result.icon}</span>
                  <div className="d-flex flex-column">
                    <span className="fw-medium">{result.title}</span>
                    <span className="small text-muted">{result.subtitle}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Layout;
