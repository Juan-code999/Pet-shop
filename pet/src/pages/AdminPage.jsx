import React, { useState, useEffect } from 'react';
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

  // Estados para contatos
  const [contatos, setContatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Busca contatos da API quando mudar de aba Home ou Workflow
  useEffect(() => {
    if (activeMenu === 'Home' || activeMenu === 'Workflow') {
      setLoading(true);
      fetch("http://localhost:5005/api/Contato/todos")  // Substitua pela URL real da sua API
        .then(res => {
          if (!res.ok) throw new Error('Erro ao carregar contatos');
          return res.json();
        })
        .then(data => {
          setContatos(data);
          setLoading(false);
          setError(null);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [activeMenu]);

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
                {loading && <p>Carregando mensagens...</p>}
                {error && <p style={{ color: "red" }}>Erro: {error}</p>}
                {!loading && !error && contatos.length === 0 && <p>Nenhuma mensagem encontrada.</p>}
                {!loading && !error && contatos.length > 0 && (
                  <ul className="message-list">
                    {contatos.map(c => (
                      <li key={c.Id}>
                        <strong>{c.Nome}:</strong> {c.Mensagem}
                      </li>
                    ))}
                  </ul>
                )}
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
            <h2>Workflow - Detalhes dos Contatos</h2>

            {loading && <p>Carregando contatos...</p>}
            {error && <p style={{ color: "red" }}>Erro: {error}</p>}

            {!loading && !error && contatos.length === 0 && <p>Nenhum contato para exibir.</p>}

            {!loading && !error && contatos.length > 0 && (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {contatos.map(c => (
                  <li key={c.Id} style={{
                    border: "1px solid #ccc",
                    borderRadius: 6,
                    padding: 15,
                    marginBottom: 15,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}>
                    <p><strong>Nome:</strong> {c.Nome}</p>
                    <p><strong>Email:</strong> {c.Email}</p>
                    <p><strong>Telefone:</strong> {c.Telefone}</p>
                    <p><strong>Mensagem:</strong> {c.Mensagem}</p>
                    <p><strong>Data de envio:</strong> {new Date(c.DataEnvio).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
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
