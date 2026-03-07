/**
 * Main App component.
 * 
 * This is the root component that sets up routing and providers.
 */

import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { ThemeInit } from './components/ThemeInit';
import { SocketProvider } from './contexts/SocketContext';

function App() {
  return (
    <BrowserRouter>
      <ThemeInit />
      <SocketProvider>
        <AppRoutes />
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;
