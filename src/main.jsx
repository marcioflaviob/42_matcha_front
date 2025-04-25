import { createRoot } from 'react-dom/client';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import 'primeicons/primeicons.css';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { UserProvider } from './context/UserContext';
import { SocketProvider } from './context/SocketContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { RefreshProvider } from "./context/RefreshContext";
import { EditProfileProvider } from './context/EditProfileContext.jsx';

createRoot(document.getElementById('root')).render(
  <EditProfileProvider>
    <RefreshProvider>
      <AuthProvider>
        <UserProvider>
          <SocketProvider>
            <Router>
              <App />
            </Router>
          </SocketProvider>
        </UserProvider>
      </AuthProvider>
    </RefreshProvider>
  </EditProfileProvider>
);