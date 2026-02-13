import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

// ─── Instance unique (singleton) ─────────────────────────────
let socket: Socket | null = null;

// ─── Connexion authentifiée ───────────────────────────────────
export const connectSocket = (): Socket => {
  // ✅ Guard corrigé : on réutilise le socket s'il existe,
  // qu'il soit en cours de connexion OU déjà connecté
  if (socket) {
    console.log('⚡ Socket déjà initialisé (id:', socket.id, ')');
    return socket;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Impossible de connecter le socket : pas de token JWT');
  }

  console.log("🔌 Création d'un nouveau socket...");

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('⚡ [SOCKET] Connecté — id:', socket?.id);
  });

  socket.on('connected', (data) => {
    console.log('✅ [SOCKET] Authentifié :', data);
  });

  socket.on('disconnect', (reason) => {
    console.warn('💤 [SOCKET] Déconnecté :', reason);
    // ✅ Si déconnexion involontaire (pas un logout),
    // on garde la référence pour la reconnexion auto
    if (reason === 'io client disconnect') {
      socket = null; // Seulement si c'est nous qui avons appelé disconnect()
    }
  });

  socket.on('connect_error', (err) => {
    console.error('❌ [SOCKET] Erreur de connexion :', err.message);
  });

  socket.on('pong', (data) => {
    console.log('🏓 [SOCKET] Pong reçu :', data);
  });

  return socket;
};

// ─── Déconnexion propre (logout uniquement) ───────────────────
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 [SOCKET] Déconnecté manuellement');
  }
};

// ─── Accès à l'instance courante ─────────────────────────────
export const getSocket = (): Socket | null => socket;

export const sendPing = (): void => {
  if (socket?.connected) {
    socket.emit('ping');
  } else {
    console.warn('⚠️ Socket non connecté, ping ignoré');
  }
};
