import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Settings, X, Info, RotateCcw } from 'lucide-react';
import { Button } from '@/libs/components/ui/button';
import { useSound } from '@/utils/soundManager';
import { useTutorial } from '@/components/Tutorial';

export function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [volume, setVolume] = useState(50);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const sound = useSound();
  const { resetTutorial } = useTutorial();

  // Charger les préférences au montage
  useEffect(() => {
    const currentVolume = sound.getVolume();
    const enabled = sound.isEnabled();
    setVolume(currentVolume * 100);
    setSoundEnabled(enabled);
  }, []);

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    sound.setVolume(value / 100);
  };

  const handleToggleSound = () => {
    const newState = sound.toggleEnabled();
    setSoundEnabled(newState);
    if (newState) {
      sound.play('button_click');
    }
  };

  const handleResetTutorial = () => {
    resetTutorial();
    setIsOpen(false);
    sound.play('button_click');
  };

  return (
    <>
      {/* Settings Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(true);
          sound.play('button_click');
        }}
        className="fixed bottom-4 right-4 z-40 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        <Settings className="w-6 h-6" />
      </motion.button>

      {/* Settings Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className="bg-card border-2 border-border rounded-2xl shadow-2xl p-6 m-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Settings className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">Paramètres</h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Sound Settings */}
                <div className="space-y-6">
                  {/* Toggle Sound */}
                  <div className="space-y-2">
                    <label className="flex items-center justify-between">
                      <span className="text-lg font-semibold flex items-center gap-2">
                        {soundEnabled ? (
                          <Volume2 className="w-5 h-5 text-primary" />
                        ) : (
                          <VolumeX className="w-5 h-5 text-muted-foreground" />
                        )}
                        Effets sonores
                      </span>
                      <button
                        onClick={handleToggleSound}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          soundEnabled ? 'bg-primary' : 'bg-muted'
                        }`}
                      >
                        <motion.span
                          layout
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 30,
                          }}
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                            soundEnabled ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </label>
                  </div>

                  {/* Volume Slider */}
                  {soundEnabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <label className="text-sm font-medium text-muted-foreground">
                        Volume : {volume}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) =>
                          handleVolumeChange(Number(e.target.value))
                        }
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </motion.div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-border" />

                  {/* Tutorial Reset */}
                  <div className="space-y-2">
                    <Button
                      onClick={handleResetTutorial}
                      variant="outline"
                      className="w-full justify-start gap-3"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Revoir le tutoriel
                    </Button>
                  </div>

                  {/* Info */}
                  <div className="bg-muted/50 rounded-lg p-4 flex gap-3">
                    <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p>
                        Les paramètres sont automatiquement sauvegardés dans
                        votre navigateur.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Bouton flottant simple pour toggle le son
 */
export function SoundToggle() {
  const [enabled, setEnabled] = useState(true);
  const sound = useSound();

  useEffect(() => {
    setEnabled(sound.isEnabled());
  }, []);

  const handleToggle = () => {
    const newState = sound.toggleEnabled();
    setEnabled(newState);
    if (newState) {
      sound.play('button_click');
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleToggle}
      className={`fixed bottom-20 right-4 z-40 p-3 rounded-full shadow-lg transition-all ${
        enabled
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground'
      }`}
    >
      {enabled ? (
        <Volume2 className="w-5 h-5" />
      ) : (
        <VolumeX className="w-5 h-5" />
      )}
    </motion.button>
  );
}
