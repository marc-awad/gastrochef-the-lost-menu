import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Coins,
  Star,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// ========================================
// 🎉 SUCCESS FEEDBACK
// ========================================

interface SuccessFeedbackProps {
  message: string;
  amount?: number;
  icon?: React.ReactNode;
  duration?: number;
  onComplete?: () => void;
}

export function SuccessFeedback({
  message,
  amount,
  icon,
  duration = 2000,
  onComplete,
}: SuccessFeedbackProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onComplete?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -20 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
        >
          <div className="bg-success text-success-foreground px-8 py-6 rounded-2xl shadow-2xl glow-success flex items-center gap-4">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 15, delay: 0.1 }}
            >
              {icon || <CheckCircle2 className="w-12 h-12" />}
            </motion.div>
            <div>
              <p className="text-2xl font-bold">{message}</p>
              {amount !== undefined && (
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg font-semibold"
                >
                  +{amount} €
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ========================================
// ❌ ERROR FEEDBACK
// ========================================

interface ErrorFeedbackProps {
  message: string;
  penalty?: number;
  duration?: number;
  onComplete?: () => void;
}

export function ErrorFeedback({
  message,
  penalty,
  duration = 2000,
  onComplete,
}: ErrorFeedbackProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onComplete?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
        >
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-destructive text-destructive-foreground px-8 py-6 rounded-2xl shadow-2xl flex items-center gap-4"
          >
            <XCircle className="w-12 h-12" />
            <div>
              <p className="text-2xl font-bold">{message}</p>
              {penalty !== undefined && (
                <p className="text-lg font-semibold">-{penalty} points</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ========================================
// 💰 MONEY ANIMATION
// ========================================

interface MoneyAnimationProps {
  amount: number;
  type: 'gain' | 'loss';
  position?: { x: number; y: number };
}

export function MoneyAnimation({
  amount,
  type,
  position,
}: MoneyAnimationProps) {
  const isGain = type === 'gain';

  return (
    <motion.div
      initial={{
        opacity: 1,
        scale: 1,
        x: position?.x || 0,
        y: position?.y || 0,
      }}
      animate={{
        opacity: 0,
        scale: 1.5,
        y: (position?.y || 0) - 100,
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      className={`fixed z-50 pointer-events-none ${
        isGain ? 'text-success' : 'text-destructive'
      }`}
      style={{ left: position?.x, top: position?.y }}
    >
      <div className="flex items-center gap-2 text-3xl font-bold drop-shadow-lg">
        <Coins className="w-8 h-8" />
        <span>
          {isGain ? '+' : '-'}
          {Math.abs(amount)}€
        </span>
      </div>
    </motion.div>
  );
}

// ========================================
// ⭐ SATISFACTION CHANGE
// ========================================

interface SatisfactionChangeProps {
  change: number;
}

export function SatisfactionChange({ change }: SatisfactionChangeProps) {
  const isPositive = change > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ type: 'spring', damping: 15 }}
      className="fixed top-24 right-4 z-50"
    >
      <div
        className={`${
          isPositive
            ? 'bg-success text-success-foreground'
            : 'bg-destructive text-destructive-foreground'
        } px-6 py-3 rounded-xl shadow-lg flex items-center gap-3`}
      >
        {isPositive ? (
          <TrendingUp className="w-6 h-6" />
        ) : (
          <TrendingDown className="w-6 h-6" />
        )}
        <span className="text-xl font-bold">
          {isPositive ? '+' : ''}
          {change} satisfaction
        </span>
      </div>
    </motion.div>
  );
}

// ========================================
// 🏆 LEVEL UP
// ========================================

interface LevelUpProps {
  newLevel: number;
  onComplete?: () => void;
}

export function LevelUp({ newLevel, onComplete }: LevelUpProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ type: 'spring', damping: 15 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        animate={{
          rotate: [0, 5, -5, 5, -5, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 0.5, repeat: 3 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 10 }}
          className="text-accent mb-4 flex justify-center"
        >
          <Star className="w-32 h-32 fill-current" />
        </motion.div>
        <h2 className="text-6xl font-bold text-gradient mb-4">Level Up!</h2>
        <p className="text-4xl text-foreground">
          Vous êtes maintenant niveau{' '}
          <span className="text-accent">{newLevel}</span>
        </p>
      </motion.div>
    </motion.div>
  );
}

// ========================================
// ⚠️ WARNING TOAST
// ========================================

interface WarningToastProps {
  message: string;
  icon?: React.ReactNode;
}

export function WarningToast({ message, icon }: WarningToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed top-4 right-4 z-50"
    >
      <div className="bg-warning text-warning-foreground px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
        {icon || <AlertTriangle className="w-6 h-6" />}
        <p className="font-semibold">{message}</p>
      </div>
    </motion.div>
  );
}

// ========================================
// ⏳ LOADING OVERLAY
// ========================================

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({
  message = 'Chargement...',
}: LoadingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="text-center">
        <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
        <p className="text-2xl text-foreground font-semibold">{message}</p>
      </div>
    </motion.div>
  );
}

// ========================================
// 🎊 CONFETTI ANIMATION
// ========================================

export function Confetti() {
  const confettiPieces = Array.from({ length: 50 });

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map((_, index) => (
        <motion.div
          key={index}
          initial={{
            x: Math.random() * window.innerWidth,
            y: -20,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: window.innerHeight + 20,
            rotate: Math.random() * 720 - 360,
            opacity: 0,
          }}
          transition={{
            duration: Math.random() * 2 + 2,
            ease: 'linear',
            delay: Math.random() * 0.5,
          }}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            backgroundColor: [
              '#EF4444',
              '#F59E0B',
              '#10B981',
              '#3B82F6',
              '#8B5CF6',
            ][Math.floor(Math.random() * 5)],
          }}
        />
      ))}
    </div>
  );
}
