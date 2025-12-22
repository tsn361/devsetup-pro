import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Installing from './pages/Installing';
import Profiles from './pages/Profiles';
import Settings from './pages/Settings';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app">
        {/* Navigation */}
        <nav className="navbar">
          <div className="navbar-brand">
            <h1>DevSetup Pro</h1>
            <p className="navbar-subtitle">Ubuntu Developer Tool Installer</p>
          </div>
          <div className="navbar-links">
            <Link to="/" className="nav-link">Dashboard</Link>
            <Link to="/profiles" className="nav-link">Profiles</Link>
            <Link to="/settings" className="nav-link">Settings</Link>
          </div>
        </nav>

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/installing" element={<Installing />} />
            <Route path="/profiles" element={<Profiles />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="footer">
          <p>DevSetup Pro v0.1.0 | Made with ❤️ for developers</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
