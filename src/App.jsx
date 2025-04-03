import './App.css';
import { Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import { Paths } from './Paths';
import ProtectedRoutes from './components/ProtectedRoutes/ProtectedRoutes';

function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<Layout />}>
          {Paths.map((item) => (
            <Route key={item.path} path={item.path} element={item.component} />
          ))}
        </Route>
      </Route>
    </Routes>
  );
}

export default App;