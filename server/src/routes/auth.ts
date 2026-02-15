import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const router = Router();

// ✅ Helper pour valider l'email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ✅ Helper pour valider le nom du restaurant
const isValidRestaurantName = (name: string): boolean => {
  if (!name || name.length < 3 || name.length > 50) return false;
  // Accepter lettres, chiffres, espaces, tirets, apostrophes et accents
  const nameRegex = /^[a-zA-Z0-9\s\-'àâäéèêëïîôùûüÿç]+$/;
  return nameRegex.test(name);
};

// ─────────────────────────────────────────────────────────────
//  POST /api/auth/register
// ─────────────────────────────────────────────────────────────
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { restaurant_name, email, password } = req.body;

    // ✅ BUG #002 FIX : Validation stricte des champs requis
    if (!restaurant_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis',
        fields: {
          restaurant_name: !!restaurant_name,
          email: !!email,
          password: !!password,
        },
      });
    }

    // ✅ BUG #009 FIX : Validation du nom du restaurant
    if (!isValidRestaurantName(restaurant_name)) {
      return res.status(400).json({
        success: false,
        message:
          'Le nom du restaurant doit contenir entre 3 et 50 caractères et ne peut contenir que des lettres, chiffres, espaces, tirets et apostrophes',
      });
    }

    // ✅ BUG #002 FIX : Validation du format email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email invalide',
      });
    }

    // ✅ BUG #002 FIX : Validation de la longueur du mot de passe
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caractères',
      });
    }

    // ✅ Vérifier si l'email existe déjà
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé',
      });
    }

    // ✅ Hacher le mot de passe
    const password_hash = await bcrypt.hash(password, 10);

    // ✅ Créer l'utilisateur
    const user = await User.create({
      restaurant_name,
      email,
      password_hash,
    });

    // ✅ BUG #001 FIX : Générer un token JWT immédiatement
    // ✅ BUG #003 FIX : Utiliser une variable validée au lieu de process.env direct
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET non défini !');
      return res.status(500).json({
        success: false,
        message: 'Erreur de configuration serveur',
      });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d', // Token valide 7 jours
    });

    console.log(`✅ [AUTH] Utilisateur créé: ${user.email} (id: ${user.id})`);

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      token, // ✅ Token retourné pour auto-login
      user: {
        id: user.id,
        email: user.email,
        restaurant_name: user.restaurant_name,
        treasury: user.treasury,
        satisfaction: user.satisfaction,
        stars: user.stars,
      },
    });
  } catch (err) {
    console.error('❌ [AUTH] Erreur register:', err);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'inscription",
    });
  }
});

// ─────────────────────────────────────────────────────────────
//  POST /api/auth/login
// ─────────────────────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // ✅ Validation des champs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis',
      });
    }

    // ✅ Chercher l'utilisateur
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides',
      });
    }

    // ✅ Vérifier le mot de passe
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides',
      });
    }

    // ✅ BUG #003 FIX : Vérifier JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET non défini !');
      return res.status(500).json({
        success: false,
        message: 'Erreur de configuration serveur',
      });
    }

    // ✅ Générer le token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    console.log(`✅ [AUTH] Connexion réussie: ${user.email} (id: ${user.id})`);

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        restaurant_name: user.restaurant_name,
        treasury: user.treasury,
        satisfaction: user.satisfaction,
        stars: user.stars,
      },
    });
  } catch (err) {
    console.error('❌ [AUTH] Erreur login:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion',
    });
  }
});

export default router;
