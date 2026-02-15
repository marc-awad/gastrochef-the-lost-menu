import dotenv from 'dotenv';

// ✅ Charger les variables d'environnement depuis .env
dotenv.config();

// ─────────────────────────────────────────────────────────────
//  Validation stricte des variables d'environnement critiques
// ─────────────────────────────────────────────────────────────

// ✅ Variables strictement requises (ne peuvent pas être vides)
const requiredEnvVars = [
  'DB_NAME',
  'DB_USER',
  'DB_HOST',
  'JWT_SECRET',
] as const;

// ✅ Variables qui doivent exister mais peuvent être vides
const optionalButMustExistVars = ['DB_PASSWORD'] as const;

const optionalEnvVars = {
  DB_PORT: '3306',
  PORT: '5000',
  CLIENT_URL: 'http://localhost:5173',
  NODE_ENV: 'development',
} as const;

// ✅ BUG #003 FIX : Vérifier que toutes les variables requises sont présentes
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

// ✅ Vérifier que DB_PASSWORD existe (même si vide)
const missingOptionalVars = optionalButMustExistVars.filter(
  (varName) => process.env[varName] === undefined
);

const allMissingVars = [...missingVars, ...missingOptionalVars];

if (allMissingVars.length > 0) {
  console.error('\n❌ ========================================');
  console.error("❌  ERREUR : Variables d'environnement manquantes");
  console.error('❌ ========================================');
  console.error('\n🔍 Variables manquantes :');
  allMissingVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.error('\n💡 Solution :');
  console.error('   1. Créez un fichier .env à la racine du projet');
  console.error('   2. Ajoutez les variables manquantes :');
  console.error('');
  console.error('      DB_NAME=gastrochef');
  console.error('      DB_USER=root');
  console.error('      DB_PASSWORD=your_password');
  console.error('      DB_HOST=localhost');
  console.error('      JWT_SECRET=your_super_secret_key_here');
  console.error('');
  console.error('❌ ========================================\n');
  process.exit(1); // ✅ Fail-fast : arrêter le serveur immédiatement
}

// ✅ Avertir si JWT_SECRET est trop court (sécurité)
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.warn('\n⚠️  ATTENTION : JWT_SECRET trop court !');
  console.warn(
    '⚠️  Recommandation : Utilisez au moins 32 caractères aléatoires'
  );
  console.warn('⚠️  Exemple : openssl rand -base64 32 (dans un terminal)\n');
}

// ─────────────────────────────────────────────────────────────
//  Export des variables typées
// ─────────────────────────────────────────────────────────────

export const ENV = {
  // Variables requises (garanties présentes)
  DB_NAME: process.env.DB_NAME!,
  DB_USER: process.env.DB_USER!,
  DB_PASSWORD: process.env.DB_PASSWORD || '', // ✅ Peut être vide pour dev local
  DB_HOST: process.env.DB_HOST!,
  JWT_SECRET: process.env.JWT_SECRET!,

  // Variables optionnelles (avec valeurs par défaut)
  DB_PORT: parseInt(process.env.DB_PORT || optionalEnvVars.DB_PORT, 10),
  PORT: parseInt(process.env.PORT || optionalEnvVars.PORT, 10),
  CLIENT_URL: process.env.CLIENT_URL || optionalEnvVars.CLIENT_URL,
  NODE_ENV: process.env.NODE_ENV || optionalEnvVars.NODE_ENV,

  // Helpers booléens
  IS_DEV: (process.env.NODE_ENV || 'development') === 'development',
  IS_PROD: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',
} as const;

// ─────────────────────────────────────────────────────────────
//  Log de confirmation (uniquement en développement)
// ─────────────────────────────────────────────────────────────

if (ENV.IS_DEV) {
  console.log('\n✅ ========================================');
  console.log("✅  Variables d'environnement validées");
  console.log('✅ ========================================');
  console.log(
    `   🗄️  Base de données : ${ENV.DB_NAME}@${ENV.DB_HOST}:${ENV.DB_PORT}`
  );
  console.log(`   🌐 Port serveur     : ${ENV.PORT}`);
  console.log(`   🔗 Client URL       : ${ENV.CLIENT_URL}`);
  console.log(`   🏷️  Environnement   : ${ENV.NODE_ENV}`);
  console.log(
    `   🔐 JWT Secret       : ${ENV.JWT_SECRET.substring(0, 10)}... (${ENV.JWT_SECRET.length} caractères)`
  );
  console.log('✅ ========================================\n');
}
