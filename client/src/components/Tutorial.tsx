import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChefHat,
  Beaker,
  BookOpen,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/libs/components/ui/button';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetPage?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenue Chef !',
    description:
      'Vous venez de reprendre un restaurant légendaire, mais le chef précédent est parti avec le livre de recettes ! Votre mission : redécouvrir toutes les recettes perdues.',
    icon: <ChefHat className="w-12 h-12" />,
  },
  {
    id: 'laboratory',
    title: 'Le Laboratoire',
    description:
      'Expérimentez en combinant des ingrédients pour découvrir de nouvelles recettes. Glissez-déposez les ingrédients et tentez votre chance !',
    icon: <Beaker className="w-12 h-12" />,
    targetPage: '/laboratory',
  },
  {
    id: 'recipes',
    title: 'Livre de Recettes',
    description:
      'Toutes les recettes que vous découvrez sont sauvegardées ici. Consultez-les quand vous en avez besoin pour servir vos clients.',
    icon: <BookOpen className="w-12 h-12" />,
    targetPage: '/recipes',
  },
  {
    id: 'marketplace',
    title: 'Le Marché',
    description:
      'Achetez les ingrédients dont vous avez besoin pour vos recettes. Gérez votre stock intelligemment pour éviter le gaspillage !',
    icon: <ShoppingCart className="w-12 h-12" />,
    targetPage: '/marketplace',
  },
  {
    id: 'service',
    title: 'Service en Salle',
    description:
      "Les commandes arrivent en temps réel ! Servez vos clients rapidement avant que leur patience ne s'épuise. Attention au timer !",
    icon: <TrendingUp className="w-12 h-12" />,
    targetPage: '/service',
  },
];

interface TutorialProps {
  onComplete: () => void;
}

export function Tutorial({ onComplete }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleSkip = () => {
    handleComplete();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleSkip}
          />

          {/* Tutorial Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl"
          >
            <div className="bg-card border-2 border-primary rounded-2xl shadow-2xl p-8 m-4">
              {/* Close button */}
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Content */}
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="bg-primary/10 text-primary p-6 rounded-full"
                >
                  {step.icon}
                </motion.div>

                {/* Title */}
                <motion.h2
                  key={step.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-bold text-gradient"
                >
                  {step.title}
                </motion.h2>

                {/* Description */}
                <motion.p
                  key={step.description}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg text-muted-foreground max-w-lg leading-relaxed"
                >
                  {step.description}
                </motion.p>

                {/* Progress indicator */}
                <div className="flex gap-2 py-4">
                  {tutorialSteps.map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentStep
                          ? 'w-8 bg-primary'
                          : index < currentStep
                            ? 'w-2 bg-primary/50'
                            : 'w-2 bg-muted'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex gap-4 w-full max-w-md pt-4">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      className="flex-1"
                    >
                      Précédent
                    </Button>
                  )}
                  <Button
                    onClick={handleNext}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {isLastStep ? 'Commencer !' : 'Suivant'}
                  </Button>
                </div>

                {/* Skip button */}
                {!isLastStep && (
                  <button
                    onClick={handleSkip}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Passer le tutoriel
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook pour gérer l'affichage du tutoriel
export function useTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Vérifier si le tutoriel a déjà été vu
    const hasSeenTutorial = localStorage.getItem('tutorial_completed');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const completeTutorial = () => {
    localStorage.setItem('tutorial_completed', 'true');
    setShowTutorial(false);
  };

  const resetTutorial = () => {
    localStorage.removeItem('tutorial_completed');
    setShowTutorial(true);
  };

  return {
    showTutorial,
    completeTutorial,
    resetTutorial,
  };
}
