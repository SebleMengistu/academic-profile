import { Routes, Route } from 'react-router-dom';
import { PublicRoutes } from './routes/PublicRoute';
import { AdminRoutes } from './routes/AdminRoute';

function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/*"       element={<PublicRoutes />} />
    </Routes>
  );
}

export default App;
