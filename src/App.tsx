// src/App.js
import "./index.css";
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import CampaignTimelinePage from './pages/CampaignTimelinePage';
import FlightGroupTimeline from "./pages/FlightGroupTimelinePage";
import FlightTimelinePage from "./pages/FlightTimelinePage";

const navBarStyle = {
    backgroundColor: '#333',
    padding: '10px',
};

const navListStyle = {
    listStyleType: 'none',
    padding: '0',
    margin: '0',
    display: 'flex',
    justifyContent: 'flex-end'
};

const navItemStyle = {
    marginRight: '15px',
};

const navLinkStyle = {
    color: 'white',
    textDecoration: 'none',
};

const navLinkHoverStyle = {
    textDecoration: 'underline',
};

function App() {
    return (
        <Router>
            <div>
                <nav style={navBarStyle}>
                    <ul style={navListStyle}>
                        <li style={navItemStyle}>
                            <Link to="/" style={navLinkStyle} onMouseOver={e => e.currentTarget.style.textDecoration = navLinkHoverStyle.textDecoration} onMouseOut={e => e.currentTarget.style.textDecoration = navLinkStyle.textDecoration}>
                                CampaignTimelinePage
                            </Link>
                        </li>
                        <li style={navItemStyle}>
                            <Link to="/group" style={navLinkStyle} onMouseOver={e => e.currentTarget.style.textDecoration = navLinkHoverStyle.textDecoration} onMouseOut={e => e.currentTarget.style.textDecoration = navLinkStyle.textDecoration}>
                                FlightGroupTimeline
                            </Link>
                        </li>
                        <li style={navItemStyle}>
                            <Link to="/flight" style={navLinkStyle} onMouseOver={e => e.currentTarget.style.textDecoration = navLinkHoverStyle.textDecoration} onMouseOut={e => e.currentTarget.style.textDecoration = navLinkStyle.textDecoration}>
                                FlightTimeline
                            </Link>
                        </li>
                    </ul>
                </nav>
                <Routes>
                    <Route path="/" element={<CampaignTimelinePage />} />
                    <Route path="/group" element={<FlightGroupTimeline />} />
                    <Route path="/flight" element={<FlightTimelinePage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
