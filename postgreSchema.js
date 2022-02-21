import { Client } from "https://deno.land/x/postgres@v0.11.3/mod.ts";

//set up connection
const client = new Client(
  "postgres://ftqrgoav:V9PQwGYE8XO7yOe9ndcoLrBCeJ5tFrrM@tyke.db.elephantsql.com/ftqrgoav"
);
await client.connect();

await client.queryArray(`DROP TABLE IF EXISTS users CASCADE`);
await client.queryArray(`DROP TABLE IF EXISTS sessions CASCADE`);
await client.queryArray(`DROP TABLE IF EXISTS scores CASCADE`);

// Create schema
await client.queryArray(
  `CREATE TABLE users (
    id SERIAL UNIQUE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    encrypted_password TEXT NOT NULL,
    created_at DATE NOT NULL,
    updated_at DATE NOT NULL
  );`
);

await client.queryArray(
  `CREATE TABLE sessions (
  uuid TEXT PRIMARY KEY UNIQUE,
  created_at DATE NOT NULL,
  user_id INTEGER,
  FOREIGN KEY(user_id) REFERENCES users(id)
  );`
);

await client.queryArray(
  `CREATE TABLE scores (
  id SERIAL UNIQUE PRIMARY KEY,
  score INTEGER NOT NULL,
  created_at DATE NOT NULL,
  user_id INTEGER NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
  );`
);

//Put in seed data
await client.queryArray(
  `INSERT INTO users
  (username, encrypted_password, created_at, updated_at)
  VALUES
  ('admin', '$2a$08$MLF.9LP6XBlWY5jG5qs8iuwPEBltYe57KEHu3eY7Pf737Xb27zHjm', CURRENT_DATE, CURRENT_DATE)
;`
);

await client.queryArray(
  `INSERT INTO users
  (username, encrypted_password, created_at, updated_at)
   VALUES
   ('player1', '$2a$08$d5Nxcj/0pkez0tmVb4CZWOcRcb4eGvo.8OOSU75ptOgZPbk7c.Kyu', CURRENT_DATE, CURRENT_DATE)
;`
);

await client.queryArray(
  `INSERT INTO scores
  (score, created_at, user_id)
   VALUES
   (3, CURRENT_DATE, 2)
;`
);
