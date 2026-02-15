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
import { Tutorial, useTutorial } from './components/Tutorial';
import { SettingsPanel } from './components/SettingsPanel';
import { PageTransition } from './components/PageTransition';

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
import Inventory from './pages/Inventory';

function AppContent() {
  const { showTutorial, completeTutorial } = useTutorial();

  return (
    <>
      <GameOverListener />
      <Toaster position="top-right" richColors />

      {/* Tutorial Modal - S'affiche au premier lancement */}
      {showTutorial && <Tutorial onComplete={completeTutorial} />}

      {/* Settings Panel - Bouton flottant */}
      <SettingsPanel />

      <Routes>
        {/* Routes Publiques */}
        <Route
          path="/"
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          }
        />
        <Route
          path="/login"
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />
        <Route
          path="/register"
          element={
            <PageTransition>
              <Register />
            </PageTransition>
          }
        />
        <Route
          path="/game-over"
          element={
            <PageTransition>
              <GameOver />
            </PageTransition>
          }
        />

        {/* Routes Protégées avec Navbar */}
        <Route
          path="/laboratory"
          element={
            <ProtectedRoute>
              <Navbar />
              <PageTransition>
                <Laboratory />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes"
          element={
            <ProtectedRoute>
              <Navbar />
              <PageTransition>
                <RecipeBook />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/service"
          element={
            <ProtectedRoute>
              <Navbar />
              <PageTransition>
                <Service />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketplace"
          element={
            <ProtectedRoute>
              <Navbar />
              <PageTransition>
                <Marketplace />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Navbar />
              <PageTransition>
                <Dashboard />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Navbar />
              <PageTransition>
                <Inventory />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <Router>
          <AppContent />
        </Router>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
