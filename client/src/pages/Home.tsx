import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChefHat,
  Beaker,
  TrendingUp,
  BookOpen,
  Users,
  Trophy,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/libs/components/ui/button';

const features = [
  {
    icon: <Beaker className="w-8 h-8" />,
    title: 'Laboratoire',
    description:
      'Expérimentez et découvrez 50 recettes perdues en combinant des ingrédients',
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: 'Gestion en temps réel',
    description: 'Servez vos clients rapidement avant expiration des commandes',
  },
  {
    icon: <BookOpen className="w-8 h-8" />,
    title: 'Livre de recettes',
    description: 'Débloquez et consultez toutes vos découvertes culinaires',
  },
  {
    icon: <Trophy className="w-8 h-8" />,
    title: 'Progression',
    description: 'Gérez votre satisfaction, trésorerie et obtenez des étoiles',
  },
];

const stats = [
  { value: '50+', label: 'Recettes' },
  { value: '20', label: 'Ingrédients' },
  { value: '3⭐', label: 'Étoiles max' },
  { value: '∞', label: 'Plaisir' },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">
                Jeu de gestion culinaire
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              GastroChef
              <br />
              <span className="text-gradient">The Lost Menu</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl"
            >
              Reprenez un restaurant légendaire et redécouvrez les recettes
              perdues en expérimentant dans votre laboratoire. Gérez votre
              établissement en temps réel et devenez un chef étoilé !
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link to="/register">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 button-ripple group"
                >
                  Commencer l'aventure
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6"
                >
                  Se connecter
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right content - Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 relative"
          >
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative"
            >
              {/* Chef Hat Icon */}
              <div className="bg-gradient-to-br from-primary to-accent p-12 rounded-3xl shadow-2xl glow">
                <ChefHat className="w-64 h-64 text-white" />
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute -top-8 -right-8 bg-accent text-accent-foreground p-4 rounded-full shadow-lg"
              >
                <Sparkles className="w-8 h-8" />
              </motion.div>

              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -bottom-4 -left-4 bg-secondary text-secondary-foreground p-4 rounded-full shadow-lg"
              >
                <Trophy className="w-8 h-8" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Fonctionnalités du jeu
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez un gameplay unique mêlant stratégie, expérimentation et
              gestion en temps réel
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-card p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-border card-hover"
              >
                <div className="bg-primary/10 text-primary w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-accent to-secondary">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Users className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Prêt à devenir un Chef Étoilé ?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Rejoignez l'aventure culinaire et prouvez que vous avez ce qu'il
              faut pour gérer le restaurant le plus prestigieux de la ville !
            </p>
            <Link to="/register">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6 button-ripple group"
              >
                Créer mon restaurant
                <ChefHat className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2026 GastroChef - The Lost Menu. Fait avec ❤️ et 🍝</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
