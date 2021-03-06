import { Client } from 'https://deno.land/x/postgres@v0.11.3/mod.ts';

//set up connection
const client = new Client(
  'postgres://ftqrgoav:V9PQwGYE8XO7yOe9ndcoLrBCeJ5tFrrM@tyke.db.elephantsql.com/ftqrgoav'
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
  username TEXT NOT NULL,
  game_time INTEGER NOT NULL
  );`
);

//Put in seed data

const answers = [
  { word: 'chant', date: '2022/02/27' },
  { word: 'choke', date: '2022/02/28' },
  { word: 'rupee', date: '2022/03/01' },
  { word: 'nasty', date: '2022/03/02' },
  { word: 'mourn', date: '2022/03/03' },
  { word: 'ahead', date: '2022/03/04' },
  { word: 'brine', date: '2022/03/05' },
];

const randomUsers = [
  'mixup692',
  'gateau650',
  'polyphonic722',
  'kimbell915',
  'grampus293',
  'lille622',
  'anemone861',
  'forsta166',
  'libratory153',
];

const getRandomNumber = () => {
  return Math.floor(Math.random() * 6 + 1);
};

const getRandomGameTime = () => {
  return Math.floor(Math.random() * (800000 - 50000 + 1) + 100000);
};

randomUsers.forEach((user) => {
  answers.forEach(async (answer) => {
    const score =
      (getRandomNumber() +
        getRandomNumber() +
        getRandomNumber() +
        getRandomNumber() +
        getRandomNumber()) /
      5;
    await client.queryArray(
      `INSERT INTO scores
      (score, created_at, word, username, game_time)
      VALUES
      (${score}, '${answer.date}', '${
        answer.word
      }', '${user}', ${getRandomGameTime()})
      ;`
    );
  });
});
