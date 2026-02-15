import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

// ─── Instance unique (singleton) ─────────────────────────────
let socket: Socket | null = null;

// ─── Connexion authentifiée ───────────────────────────────────
export const connectSocket = (): Socket => {
  // ✅ BUG #007 FIX : Vérifier l'état de connexion précis
  if (socket && (socket.connected || socket.connecting)) {
    console.log(
      '⚡ Socket déjà actif (id:',
      socket.id,
      ', connected:',
      socket.connected,
      ', connecting:',
      socket.connecting,
      ')'
    );
    return socket;
  }

  // ✅ BUG #007 FIX : Si socket existe mais déconnecté, le recréer proprement
  if (socket && !socket.connected && !socket.connecting) {
    console.log('🔄 Socket déconnecté, destruction et recréation...');
    socket.removeAllListeners(); // ✅ Nettoyer tous les listeners
    socket.disconnect();
    socket = null;
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
    reconnectionDelayMax: 5000,
    timeout: 10000,
  });

  socket.on('connect', () => {
    console.log('⚡ [SOCKET] Connecté — id:', socket?.id);
  });

  socket.on('connected', (data) => {
    console.log('✅ [SOCKET] Authentifié :', data);
  });

  socket.on('disconnect', (reason) => {
    console.warn('💤 [SOCKET] Déconnecté :', reason);
    // ✅ Si déconnexion volontaire (logout), on nettoie
    if (reason === 'io client disconnect') {
      socket = null;
      console.log('🔌 [SOCKET] Instance socket nettoyée (logout)');
    }
    // ✅ Sinon (io server disconnect, transport error), on garde la référence
    // pour que socket.io puisse se reconnecter automatiquement
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log(`🔄 [SOCKET] Reconnexion réussie (tentative ${attemptNumber})`);
  });

  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log(`🔄 [SOCKET] Tentative de reconnexion ${attemptNumber}...`);
  });

  socket.on('reconnect_error', (error) => {
    console.error('❌ [SOCKET] Erreur de reconnexion :', error.message);
  });

  socket.on('reconnect_failed', () => {
    console.error(
      '❌ [SOCKET] Reconnexion échouée après 5 tentatives. Veuillez recharger la page.'
    );
    // ✅ Nettoyer le socket qui ne se reconnectera jamais
    if (socket) {
      socket.removeAllListeners();
      socket = null;
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
    console.log('🔌 [SOCKET] Déconnexion manuelle (logout)...');
    socket.removeAllListeners(); // ✅ Nettoyer tous les listeners
    socket.disconnect();
    socket = null;
    console.log('✅ [SOCKET] Déconnecté et nettoyé');
  }
};

// ─── Accès à l'instance courante ─────────────────────────────
export const getSocket = (): Socket | null => socket;

// ─── Ping utilitaire pour tester la connexion ────────────────
export const sendPing = (): void => {
  if (socket?.connected) {
    console.log('🏓 [SOCKET] Envoi ping...');
    socket.emit('ping');
  } else {
    console.warn('⚠️ Socket non connecté, ping ignoré');
  }
};

// ─── Helper pour vérifier l'état de la connexion ─────────────
export const isSocketConnected = (): boolean => {
  return socket?.connected ?? false;
};

// ─── Helper pour forcer une reconnexion ──────────────────────
export const forceReconnect = (): void => {
  if (socket) {
    console.log('🔄 [SOCKET] Reconnexion forcée...');
    socket.disconnect();
    socket.connect();
  }
};
