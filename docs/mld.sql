CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  restaurant_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  satisfaction_points INT DEFAULT 20,
  stars INT DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ingredients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  price DECIMAL(10,2)
);

CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  sale_price DECIMAL(10,2)
);

CREATE TABLE recipe_ingredients (
  recipe_id INT REFERENCES recipes(id),
  ingredient_id INT REFERENCES ingredients(id),
  quantity INT,
  PRIMARY KEY(recipe_id, ingredient_id)
);
