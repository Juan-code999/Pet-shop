import React, { useState } from 'react';
import '../styles/AdminPage.css';
import {
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const pieData = [
  { name: 'Websites', value: 400 },
  { name: 'Logo', value: 300 },
  { name: 'Social Media', value: 300 },
  { name: 'Adwords', value: 200 },
  { name: 'E-Commerce', value: 360 },
];

const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#1e3a8a'];

const lineData = [
  { name: 'Jan', value: 200 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 250 },
  { name: 'Apr', value: 400 },
  { name: 'May', value: 300 },
  { name: 'Jun', value: 350 },
  { name: 'Jul', value: 260 },
];

export default function AdminPage() {
  const [activeMenu, setActiveMenu] = useState('Home');

  const menuItems = ['Home', 'Workflow', 'Statistics', 'Calendar', 'Users', 'Settings'];

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <h2>Menu</h2>
        <ul>
          {menuItems.map(item => (
            <li
              key={item}
              className={activeMenu === item ? 'active' : ''}
              onClick={() => setActiveMenu(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      </aside>

      <main className="main-content">
        <h1>Hello John! <span className="menu-label">({activeMenu})</span></h1>

        {activeMenu === 'Home' && (
          <>
            <div className="dashboard-charts">
              <div className="chart-box">
                <h3>Your Sales</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" outerRadius={80} label>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-box">
                <h3>Report</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={lineData}>
                    <CartesianGrid stroke="#eee" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="dashboard-cards">
              <div className="card">
                <h3>Tasks</h3>
                <ul className="task-list">
                  <li><input type="checkbox" /> Respond client feedback</li>
                  <li><input type="checkbox" /> Finish dashboard layout</li>
                  <li><input type="checkbox" /> Deploy website updates</li>
                </ul>
              </div>

              <div className="card">
                <h3>Messages</h3>
                <ul className="message-list">
                  <li><strong>Ana:</strong> Please review the last changes.</li>
                  <li><strong>Pedro:</strong> Are we publishing today?</li>
                  <li><strong>Lucas:</strong> Approved the new layout!</li>
                </ul>
              </div>

              <div className="card">
                <h3>Recent Activity</h3>
                <ul className="activity-list">
                  <li>✓ Created new project folder</li>
                  <li>✓ Updated Sales Pie Chart</li>
                  <li>✓ Added new task for development</li>
                </ul>
              </div>
            </div>
          </>
        )}

        {activeMenu === 'Workflow' && (
          <div className="section">
            <h2>Workflow Section</h2>
            <p>Here you can manage your project workflows.</p>
          </div>
        )}

        {activeMenu === 'Statistics' && (
          <div className="section">
            <h2>Statistics</h2>
            <p>Analytics and performance reports will be displayed here.</p>
          </div>
        )}

        {activeMenu === 'Calendar' && (
          <div className="section">
            <h2>Calendar</h2>
            <p>Your scheduled tasks and events will appear here.</p>
          </div>
        )}

        {activeMenu === 'Users' && (
          <div className="section">
            <h2>User Management</h2>
            <p>Add, remove, or edit user roles and permissions.</p>
          </div>
        )}

        {activeMenu === 'Settings' && (
          <div className="section">
            <h2>Settings</h2>
            <p>Configure your preferences and account settings.</p>
          </div>
        )}
      </main>
    </div>
  );
}
