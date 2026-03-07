/**
 * Main App component.
 * 
 * This is the root component that sets up routing and providers.
 */

import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';

/**
 * Root App component.
 */
function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
