import { Application } from 'https://deno.land/x/abc/mod.ts';
import { abcCors } from 'https://deno.land/x/cors/mod.ts';
import { Client } from 'https://deno.land/x/postgres@v0.11.3/mod.ts';
import { config } from 'https://deno.land/x/dotenv/mod.ts';

//set up database with environment variables

const DENO_ENV = Deno.env.get('DENO_ENV') ?? 'development';
config({ path: `./.env.${DENO_ENV}`, export: true });

const PORT = parseInt(Deno.env.get('PORT')) || 80;
const scoresURL = Deno.env.get('scoresURL');

const db = new Client(scoresURL);
await db.connect();

//set up app

const app = new Application();
const allowedHeaders = [
  'Authorization',
  'Content-Type',
  'Accept',
  'Origin',
  'User-Agent',
];

const allowedMethods = ['GET', 'POST', 'DELETE'];

const corsConfig = abcCors({
  Headers: allowedHeaders,
  Methods: allowedMethods,
  credentials: true,
});

app.use(corsConfig);

app
  .get("/", home)
  .get("/scores", getScores)
  .get("/guesses", getGuesses)
  .post("/scores", postScore)
  .post("/guesses", postGuess)
  .post("/updateGuesses", updateGuess)
  .delete("/scores/:id", deleteScore)
  .start({ port: PORT });

async function home(server) {
  server.json({ response: 'server running' }, 200);
}

async function getScores(server) {
  const conditionals = server.queryParams;
  const paramsPresent = JSON.stringify(conditionals) !== '{}';
  let query = `SELECT * FROM scores`;

  if (paramsPresent) {
    const paramsAreValid = checkValidParams(conditionals);
    if (paramsAreValid) {
      query += ' WHERE ';
      let paramCounter = 1;

      Object.keys(conditionals).forEach((param, i) => {
        query += `${i > 0 ? ' AND' : ''} ${param} = $${paramCounter}`;
        paramCounter++;
      });
    } else {
      return server.json(
        {
          response:
            'Invalid query params. Allowed params are username, word or date',
        },
        400
      );
    }
  }

  query += ` ORDER BY score ASC, game_time ASC`;

  const scores = (
    await db.queryObject({
      text: query,
      args: Object.values(conditionals),
    })
  ).rows;

  server.json({ scores }, 200);
}

function checkValidParams(conditionals) {
  const validParams = ['username', 'word', 'date'];
  const allKeysInTable = Object.keys(conditionals).every((key) =>
    validParams.includes(key)
  );
  return allKeysInTable ? true : false;
}

async function postScore(server) {
  const { score, word, username, gameTime } = await server.body;
  if (!score || !word || !username || !gameTime) {
    return server.json(
      {
        response:
          'Item(s) missing, need username, word, score and game time for a valid request.',
      },
      400
    );
  }

  const query = `INSERT INTO scores
                 (score, created_at, word, username, game_time)
                 VALUES
                 ($1, current_timestamp, $2, $3, $4)
                ;`;
  await db.queryArray({ text: query, args: [score, word, username, gameTime] });
  return server.json({ response: 'score successfully added' }, 200);
}

// Used in test file to remove test score
async function deleteScore(server) {
  const { id } = server.params;
  const query = `DELETE FROM scores WHERE id = $1`;
  await db.queryArray({ text: query, args: [id] });
  return server.json({ response: 'score entry deleted' }, 200);
}

async function postGuess(server) {
  const { username, date, guess_1 } = await server.body;
  if (!username || !date || !guess_1) {
    return server.json(
      {
        response:
          "Item(s) missing, need username, date, and guess for a valid request.",
      },
      400
    );
  }

  const query = `INSERT INTO guesses
                (username, date, guess_1)
                VALUES
                ($1, $2, $3);`;
  await db.queryArray({ text: query, args: [username, date, guess_1] });
  return server.json({ response: "guess successfully added" }, 200);
}

async function updateGuess(server) {
  const { username, date, guess, count } = await server.body;
  if (!username || !date || !guess || !count) {
    return server.json(
      {
        response:
          "Item(s) missing, need username, date, guess and count for a valid request.",
      },
      400
    );
  }

  const query = `UPDATE guesses
                SET guess_${count} = $1
                WHERE username = $2 AND date = $3;`;
  await db.queryArray({ text: query, args: [guess, username, date] });
  return server.json({ response: "guess successfully updated" }, 200);
}

async function getGuesses(server) {
  const { username, date } = await server.queryParams;
  if (!username || !date) {
    return server.json(
      {
        response:
          "Item(s) missing, need username and date for a valid request.",
      },
      400
    );
  }

  const query = `SELECT * FROM guesses
                WHERE username = $1 AND date = $2;`;
  const guesses = (
    await db.queryObject({ text: query, args: [username, date] })
  ).rows;
  return server.json({ guesses }, 200);
}

console.log(`Server running on http://localhost:${PORT}`);
