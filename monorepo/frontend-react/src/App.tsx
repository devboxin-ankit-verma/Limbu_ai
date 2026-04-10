/**
 * Root App component — wires auth and routing together.
 */

import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated, login, logout, error, loading } = useAuth();

  return (
    <BrowserRouter>
      <AppRoutes
        isAuthenticated={isAuthenticated}
        onLogin={login}
        onLogout={logout}
        loginError={error}
        loginLoading={loading}
      />
    </BrowserRouter>
  );
}

export default App;
