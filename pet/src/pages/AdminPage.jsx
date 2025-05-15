import React from 'react';
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
  return (
    <div className="admin-container">
      <aside className="sidebar">
        <h2>Menu</h2>
        <ul>
          <li>Home</li>
          <li>Workflow</li>
          <li>Statistics</li>
          <li>Calendar</li>
          <li>Users</li>
          <li>Settings</li>
        </ul>
      </aside>

      <main className="main-content">
        <h1>Hello John!</h1>

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
  {/* TASKS */}
  <div className="card">
    <h3>Tasks</h3>
    <ul className="task-list">
      <li><input type="checkbox" /> Respond client feedback</li>
      <li><input type="checkbox" /> Finish dashboard layout</li>
      <li><input type="checkbox" /> Deploy website updates</li>
    </ul>
  </div>

  {/* MESSAGES */}
  <div className="card">
    <h3>Messages</h3>
    <ul className="message-list">
      <li><strong>Ana:</strong> Please review the last changes.</li>
      <li><strong>Pedro:</strong> Are we publishing today?</li>
      <li><strong>Lucas:</strong> Approved the new layout!</li>
    </ul>
  </div>

  {/* ACTIVITY */}
  <div className="card">
    <h3>Recent Activity</h3>
    <ul className="activity-list">
      <li>✓ Created new project folder</li>
      <li>✓ Updated Sales Pie Chart</li>
      <li>✓ Added new task for development</li>
    </ul>
  </div>
</div>


       
      </main>
    </div>
  );
}
