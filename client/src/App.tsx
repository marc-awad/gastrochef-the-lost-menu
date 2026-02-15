import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { GameOverListener } from './components/GameOverListener';
import { Navbar } from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'sonner';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import { Laboratory } from './pages/Laboratory';
import { RecipeBook } from './pages/RecipeBook';
import Service from './pages/Service';
import GameOver from './pages/GameOver';
import Marketplace from './pages/Marketplace';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <Router>
          <GameOverListener />
          <Toaster position="top-right" richColors />

          <Routes>
            {/* Routes Publiques (sans GameHeader) */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/game-over" element={<GameOver />} />

            {/* Routes Protégées avec Navbar uniquement */}
            <Route
              path="/laboratory"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Laboratory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recipes"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <RecipeBook />
                </ProtectedRoute>
              }
            />
            <Route
              path="/service"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Service />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Marketplace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Redirection par défaut */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
