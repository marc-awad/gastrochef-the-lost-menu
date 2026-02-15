import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

// Variants d'animation pour les pages
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

/**
 * Wrapper pour ajouter des transitions fluides entre les pages
 * Usage: <PageTransition><YourPage /></PageTransition>
 */
export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Variants alternatifs pour différents types de transitions

export const slideVariants = {
  initial: { x: -100, opacity: 0 },
  in: { x: 0, opacity: 1 },
  out: { x: 100, opacity: 0 },
};

export const scaleVariants = {
  initial: { scale: 0.9, opacity: 0 },
  in: { scale: 1, opacity: 1 },
  out: { scale: 1.1, opacity: 0 },
};

export const rotateVariants = {
  initial: { rotate: -5, opacity: 0 },
  in: { rotate: 0, opacity: 1 },
  out: { rotate: 5, opacity: 0 },
};

/**
 * Transition personnalisée avec variants au choix
 */
interface CustomPageTransitionProps {
  children: ReactNode;
  variants?: typeof pageVariants;
}

export function CustomPageTransition({
  children,
  variants = pageVariants,
}: CustomPageTransitionProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={variants}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
