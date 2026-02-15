// ========================================
// 🎵 SOUND SYSTEM - GastroChef
// ========================================

type SoundName =
  | 'new_order'
  | 'order_served'
  | 'order_expired'
  | 'recipe_discovered'
  | 'coin_earn'
  | 'coin_loss'
  | 'level_up'
  | 'game_over'
  | 'button_click'
  | 'success'
  | 'error'
  | 'notification';

class SoundManager {
  private sounds: Map<SoundName, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    this.loadFromLocalStorage();
  }

  /**
   * Initialiser tous les sons
   * Note: Les fichiers audio doivent être placés dans /public/sounds/
   */
  init() {
    // Sons de notifications
    this.loadSound('new_order', '/sounds/bell.mp3');
    this.loadSound('notification', '/sounds/notification.mp3');

    // Sons de succès/échec
    this.loadSound('order_served', '/sounds/success.mp3');
    this.loadSound('order_expired', '/sounds/fail.mp3');
    this.loadSound('recipe_discovered', '/sounds/discovery.mp3');
    this.loadSound('success', '/sounds/success.mp3');
    this.loadSound('error', '/sounds/error.mp3');

    // Sons monétaires
    this.loadSound('coin_earn', '/sounds/coin.mp3');
    this.loadSound('coin_loss', '/sounds/coin-loss.mp3');

    // Sons de progression
    this.loadSound('level_up', '/sounds/level-up.mp3');
    this.loadSound('game_over', '/sounds/game-over.mp3');

    // UI
    this.loadSound('button_click', '/sounds/click.mp3');
  }

  /**
   * Charger un son
   */
  private loadSound(name: SoundName, path: string) {
    try {
      const audio = new Audio(path);
      audio.volume = this.volume;
      audio.preload = 'auto';
      this.sounds.set(name, audio);
    } catch (error) {
      console.warn(`Failed to load sound: ${name}`, error);
    }
  }

  /**
   * Jouer un son
   */
  play(name: SoundName) {
    if (!this.enabled) return;

    const sound = this.sounds.get(name);
    if (sound) {
      // Cloner le son pour permettre plusieurs instances simultanées
      const clone = sound.cloneNode() as HTMLAudioElement;
      clone.volume = this.volume;
      clone.play().catch((error) => {
        console.warn(`Failed to play sound: ${name}`, error);
      });
    }
  }

  /**
   * Activer/désactiver les sons
   */
  toggleEnabled() {
    this.enabled = !this.enabled;
    this.saveToLocalStorage();
    return this.enabled;
  }

  /**
   * Définir le volume (0 à 1)
   */
  setVolume(value: number) {
    this.volume = Math.max(0, Math.min(1, value));
    this.sounds.forEach((sound) => {
      sound.volume = this.volume;
    });
    this.saveToLocalStorage();
  }

  /**
   * Obtenir le volume actuel
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Vérifier si les sons sont activés
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Sauvegarder les préférences
   */
  private saveToLocalStorage() {
    localStorage.setItem('sound_enabled', String(this.enabled));
    localStorage.setItem('sound_volume', String(this.volume));
  }

  /**
   * Charger les préférences
   */
  private loadFromLocalStorage() {
    const enabled = localStorage.getItem('sound_enabled');
    const volume = localStorage.getItem('sound_volume');

    if (enabled !== null) {
      this.enabled = enabled === 'true';
    }

    if (volume !== null) {
      this.volume = parseFloat(volume);
    }
  }
}

// Instance singleton
export const soundManager = new SoundManager();

// Initialiser les sons au chargement de l'application
if (typeof window !== 'undefined') {
  soundManager.init();
}

// Hooks React pour faciliter l'utilisation
export const useSound = () => {
  return {
    play: (name: SoundName) => soundManager.play(name),
    toggleEnabled: () => soundManager.toggleEnabled(),
    setVolume: (value: number) => soundManager.setVolume(value),
    getVolume: () => soundManager.getVolume(),
    isEnabled: () => soundManager.isEnabled(),
  };
};
