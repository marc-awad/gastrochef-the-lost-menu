import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import Register from './pages/Register';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import { Laboratory } from './pages/Laboratory';
import { RecipeBook } from './pages/RecipeBook';
import { GameProvider } from './context/GameContext';
import Service from './pages/Service';
import './index.css';

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <Router>
          <Toaster position="top-center" richColors />
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/laboratory"
              element={
                <ProtectedRoute>
                  <Laboratory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recipes-book"
              element={
                <ProtectedRoute>
                  <RecipeBook />
                </ProtectedRoute>
              }
            />
            <Route
              path="/service"
              element={
                <ProtectedRoute>
                  <Service />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </GameProvider>
    </AuthProvider>
  );
}
