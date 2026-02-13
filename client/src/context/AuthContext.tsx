import { createContext, useState, useContext, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import axios from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

type AuthContextType = {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    restaurant_name: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('token')
  );
  // ✅ Ref pour éviter le double-appel de React StrictMode
  const socketInitialized = useRef(false);

  useEffect(() => {
    if (token) {
      if (!socketInitialized.current) {
        socketInitialized.current = true;
        connectSocket();
      }
    } else {
      socketInitialized.current = false;
      disconnectSocket();
    }

    // ✅ Pas de cleanup qui disconnecte ici —
    // StrictMode appelle cleanup puis re-exécute l'effect,
    // sans cleanup de disconnect on évite le cycle connect/disconnect/connect
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await axios.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
  };

  const register = async (
    restaurant_name: string,
    email: string,
    password: string
  ) => {
    const res = await axios.post('/auth/register', {
      restaurant_name,
      email,
      password,
    });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    socketInitialized.current = false;
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
