import React, { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Badge, Form } from "react-bootstrap";
import { getCurrentUser, clearSession, fetchJson, canManageUsers } from "./api";

function Layout() {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [globalResults, setGlobalResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [theme, setTheme] = useState(() => localStorage.getItem("eklavya-theme") || "default");
  
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const commandInputRef = useRef(null);

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
    { name: "Notifications", path: "notifications", icon: "🔔" },
    { name: "Profile", path: "profile", icon: "👤" },
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (showCommandPalette) {
      commandInputRef.current?.focus();
    }
  }, [showCommandPalette]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setGlobalResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await fetchJson(`/api/search/?q=${encodeURIComponent(searchQuery)}`);
        setGlobalResults(data.results || []);
      } catch (e) {
        console.error("Search failed", e);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  const filteredPages = pages.filter(page => 
    page.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <div className="d-flex align-items-center gap-2 mb-4 px-2">
          <div style={{ width: 32, height: 32, background: 'var(--primary-gradient)', borderRadius: '8px' }}></div>
          <h2 className="fs-4 m-0 gradient-text">Eklavya</h2>
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
                <span className="fs-5">{page.icon}</span>
                {page.name}
                {page.name === "Notifications" && unreadCount > 0 && (
                  <Badge bg="danger" pill className="ms-auto">{unreadCount}</Badge>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-top">
          <Form.Select 
            size="sm" 
            value={theme} 
            onChange={(e) => setTheme(e.target.value)} 
            className="mb-3 border-0 bg-light rounded-pill px-3 fw-bold"
          >
            <option value="default">💎 Modern Azure</option>
            <option value="midnight">🌑 Midnight Pro</option>
            <option value="lavender">🔮 Royal Velvet</option>
            <option value="sunset">🌅 Crimson Sunset</option>
            <option value="emerald">🌿 Emerald Forest</option>
          </Form.Select>
          <button className="btn btn-link text-danger p-0 nav-link fw-semibold" onClick={handleLogout}>
            🚪 Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="app-navbar d-flex d-lg-none align-items-center justify-content-between">
        <h2 className="fs-5 m-0 gradient-text">Eklavya</h2>
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-link p-0 text-dark" onClick={() => setShowCommandPalette(true)}>🔍</button>
          <NavLink to="notifications" className="text-dark position-relative">
            🔔 {unreadCount > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>{unreadCount}</span>}
          </NavLink>
        </div>
      </header>

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
                placeholder="Type to search pages, students, or records..." 
                className="command-input"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Badge bg="light" text="dark" className="border">ESC</Badge>
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
