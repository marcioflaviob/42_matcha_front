import { createRoot } from 'react-dom/client';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import 'primeicons/primeicons.css';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { UserProvider } from './context/UserContext';
import { SocketProvider } from './context/SocketContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <UserProvider>
      <SocketProvider>
        <Router>
          <App />
        </Router>
      </SocketProvider>
    </UserProvider>
  </AuthProvider>
);