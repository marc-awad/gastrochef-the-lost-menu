USE gastrochef;

-- 1. Ajouter la colonne expiration_date
ALTER TABLE `inventory` 
ADD COLUMN `expiration_date` DATETIME NOT NULL 
AFTER `purchased_at`;

-- 2. Remplir les valeurs existantes (purchased_at + 7 jours)
UPDATE `inventory` 
SET `expiration_date` = DATE_ADD(`purchased_at`, INTERVAL 7 DAY);

-- 3. Supprimer l'ancien index unique (si il existe)
DROP INDEX `uq_inventory_user_ingredient` ON `inventory`;

-- 4. Les nouveaux index seront créés automatiquement par Sequelize au démarrage