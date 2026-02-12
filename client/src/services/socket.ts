import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

// ─── Instance unique (singleton) ─────────────────────────────
let socket: Socket | null = null;

// ─── Connexion authentifiée ───────────────────────────────────
export const connectSocket = (): Socket => {
  if (socket?.connected) {
    console.log('⚡ Socket déjà connecté');
    return socket;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Impossible de connecter le socket : pas de token JWT');
  }

  socket = io(SOCKET_URL, {
    auth: { token }, // ← envoyé au middleware JWT côté serveur
    transports: ['websocket'], // évite le fallback polling
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  // ── Événements de base ──────────────────────────────────────
  socket.on('connect', () => {
    console.log('⚡ [SOCKET] Connecté — id:', socket?.id);
  });

  socket.on('connected', (data) => {
    console.log('✅ [SOCKET] Authentifié :', data);
  });

  socket.on('disconnect', (reason) => {
    console.warn('💤 [SOCKET] Déconnecté :', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('❌ [SOCKET] Erreur de connexion :', err.message);
  });

  // ── Pong (debug) ────────────────────────────────────────────
  socket.on('pong', (data) => {
    console.log('🏓 [SOCKET] Pong reçu :', data);
  });

  return socket;
};

// ─── Déconnexion propre ───────────────────────────────────────
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 [SOCKET] Déconnecté manuellement');
  }
};

// ─── Accès à l'instance courante ─────────────────────────────
export const getSocket = (): Socket | null => socket;

// ─── Helper : envoyer un ping (debug) ────────────────────────
export const sendPing = (): void => {
  if (socket?.connected) {
    socket.emit('ping');
  } else {
    console.warn('⚠️ Socket non connecté, ping ignoré');
  }
};
