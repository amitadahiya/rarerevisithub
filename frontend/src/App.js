import React from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Sidebar } from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ContentStudio from './pages/ContentStudio';
import Settings from './pages/Settings';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-64 min-h-screen">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/content" element={<ContentStudio />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/scheduler" element={<ComingSoon title="Scheduler" />} />
              <Route path="/inbox" element={<ComingSoon title="Social Inbox" />} />
              <Route path="/analytics" element={<ComingSoon title="Analytics" />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
      <Toaster 
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#121212',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }
        }}
      />
    </div>
  );
}

const ComingSoon = ({ title }) => (
  <div className="flex items-center justify-center h-screen p-8">
    <div className="text-center">
      <h1 className="text-4xl font-serif text-white mb-4">{title}</h1>
      <p className="text-white/50">Coming soon in Phase 2...</p>
    </div>
  </div>
);

export default App;