import { Application } from "https://deno.land/x/abc/mod.ts";
import { abcCors } from "https://deno.land/x/cors/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.3.0/mod.ts";
import { v4 } from "https://deno.land/std/uuid/mod.ts";
import { Client } from "https://deno.land/x/postgres@v0.11.3/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

//set up database with environment variables

const DENO_ENV = Deno.env.get("DENO_ENV") ?? "development";
config({ path: `./.env.${DENO_ENV}`, export: true });

const userDataURL = Deno.env.get("userDataURL");

const user_db = new Client(userDataURL);
await user_db.connect();

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
  .get("/", async (server) => server.json({ response: "server running" }, 200))
  .start({ port: PORT });

console.log(`Server running on http://localhost:${PORT}`);
