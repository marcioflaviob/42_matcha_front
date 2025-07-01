import { createRoot } from 'react-dom/client';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import 'primeicons/primeicons.css';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { UserProvider } from './context/UserContext';
import { SocketProvider } from './context/SocketContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { MapProvider } from './context/MapContext.jsx';
import { PrimeReactProvider } from 'primereact/api';

createRoot(document.getElementById('root')).render(
  <PrimeReactProvider>
    <AuthProvider>
      <MapProvider>
        <UserProvider>
          <SocketProvider>
              <Router>
                <App />
              </Router>
          </SocketProvider>
        </UserProvider>
      </MapProvider>
    </AuthProvider>
  </PrimeReactProvider>
);