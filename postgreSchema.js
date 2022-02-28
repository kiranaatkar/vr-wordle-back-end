import { Client } from "https://deno.land/x/postgres@v0.11.3/mod.ts";

//set up connection
const client = new Client(
  "postgres://ftqrgoav:V9PQwGYE8XO7yOe9ndcoLrBCeJ5tFrrM@tyke.db.elephantsql.com/ftqrgoav"
);
await client.connect();

// delete tables to be rebuilt
await client.queryArray(`DROP TABLE IF EXISTS scores CASCADE`);

// Create schema

await client.queryArray(
  `CREATE TABLE scores (
  id SERIAL UNIQUE PRIMARY KEY,
  score INTEGER NOT NULL,
  created_at DATE NOT NULL,
  word TEXT NOT NULL,
  username TEXT NOT NULL
  );`
);

//Put in seed data

await client.queryArray(
  `INSERT INTO scores
  (score, created_at, word, username)
   VALUES
   (3, CURRENT_DATE, 'choke', 'player1')
;`
);

await client.queryArray(
  `INSERT INTO scores
  (score, created_at, word, username)
   VALUES
   (2, CURRENT_DATE, 'choke', 'player2')
;`
);

await client.queryArray(
  `INSERT INTO scores
  (score, created_at, word, username)
   VALUES
   (3, CURRENT_DATE, 'choke', 'player3')
;`
);

await client.queryArray(
  `INSERT INTO scores
  (score, created_at, word, username)
   VALUES
   (4, CURRENT_DATE, 'choke', 'player4')
;`
);

await client.queryArray(
  `INSERT INTO scores
  (score, created_at, word, username)
   VALUES
   (4, CURRENT_DATE, 'choke', 'player5')
;`
);

await client.queryArray(
  `INSERT INTO scores
  (score, created_at, word, username)
   VALUES
   (4, CURRENT_DATE, 'choke', 'player6')
;`
);

await client.queryArray(
  `INSERT INTO scores
  (score, created_at, word, username)
   VALUES
   (3, CURRENT_DATE, 'choke', 'player7')
;`
);

await client.queryArray(
  `INSERT INTO scores
  (score, created_at, word, username)
   VALUES
   (3, CURRENT_DATE, 'choke', 'player8')
;`
);

await client.queryArray(
  `INSERT INTO scores
  (score, created_at, word, username)
   VALUES
   (3, CURRENT_DATE, 'choke', 'player9')
;`
);
