import { Application } from "https://deno.land/x/abc/mod.ts";
import { abcCors } from "https://deno.land/x/cors/mod.ts";
import { Client } from "https://deno.land/x/postgres@v0.11.3/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

//set up database with environment variables

const DENO_ENV = Deno.env.get("DENO_ENV") ?? "development";
config({ path: `./.env.${DENO_ENV}`, export: true });

const scoresURL = Deno.env.get("scoresURL");

const db = new Client(scoresURL);
await db.connect();

//set up app

const app = new Application();
const allowedHeaders = [
  "Authorization",
  "Content-Type",
  "Accept",
  "Origin",
  "User-Agent",
];
const allowedMethods = ["GET", "POST", "DELETE"];
const PORT = parseInt(Deno.env.get("PORT")) || 80;

const corsConfig = abcCors({
  origin: ["http://localhost:3000", "http://localhost"],
  Headers: allowedHeaders,
  Methods: allowedMethods,
  credentials: true,
});

app.use(corsConfig);

// Make paths
app
  .get("/", home)
  .get("/scores", getScores)
  .post("/scores", postScore)
  .start({ port: PORT });

async function home(server) {
  server.json({ response: "server running" }, 200);
}

// /scores?username=username&date=date&word=word
async function getScores(server) {
  const conditionals = server.queryParams;
  const paramsPresent = JSON.stringify(conditionals) !== "{}";
  let query = `SELECT * FROM scores`;

  if (paramsPresent) {
    const paramsAreValid = checkValidParams(conditionals);
    if (paramsAreValid) {
      query += " WHERE ";
      let paramCounter = 1;

      Object.keys(conditionals).forEach((param, i) => {
        query += `${i > 0 ? " AND" : ""} ${param} = $${paramCounter}`;
        paramCounter++;
      });
    } else {
      return server.json(
        {
          response:
            "Invalid query params. Allowed params are username, word or date",
        },
        400
      );
    }
  }

  const scores = (
    await db.queryObject({
      text: query,
      args: Object.values(conditionals),
    })
  ).rows;

  server.json({ scores }, 200);
}

function checkValidParams(conditionals) {
  const validParams = ["username", "word", "date"];
  const allKeysInTable = Object.keys(conditionals).every((key) =>
    validParams.includes(key)
  );
  return allKeysInTable ? true : false;
}

async function postScore(server) {}

console.log(`Server running on http://localhost:${PORT}`);
