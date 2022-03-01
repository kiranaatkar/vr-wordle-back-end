//import assert methods from deno library
import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import { test, TestSuite } from 'https://deno.land/x/test_suite@0.9.5/mod.ts';
import { sleep } from 'https://deno.land/x/sleep/mod.ts';

const apiURL = 'http://localhost:8080';
const path = 'server.js';
let server = undefined;

async function setupServer() {
  const server = await Deno.run({
    cmd: ['deno', 'run', '--unstable', '-A', path],
  });
  await sleep(1.5);
  return server;
}

const suite = new TestSuite({
  name: 'Test on scores db',
  async beforeEach() {
    server = await setupServer();
  },
  async afterEach() {
    if (server) {
      await server.close();
      server = undefined;
    }
  },
});

test(suite, '/scores returns all scores in db', async () => {
  const response = await fetch(`${apiURL}/scores`);
  const json = await response.json();
  assertEquals(json.scores.length, 63);
});

// ---------- QUERY PARAMS ---------- //

test(suite, 'word query param works correctly', async () => {
  const response = await fetch(`${apiURL}/scores?word=rupee`);
  const json = await response.json();
  const allScoresContainWord = json.scores.every(
    (score) => score.word === 'rupee'
  );
  assertEquals(allScoresContainWord, true);
});

test(suite, 'username query param works correctly', async () => {
  const response = await fetch(`${apiURL}/scores?username=mixup692`);
  const json = await response.json();
  const onlyUserScores = json.scores.every(
    (score) => score.username === 'mixup692'
  );
  assertEquals(onlyUserScores, true);
});

test(suite, 'combination of query params works correctly', async () => {
  const response = await fetch(`${apiURL}/scores?username=mixup692&word=rupee`);
  const json = await response.json();
  const conditionsMet = json.scores.every((score) => {
    return score.username === 'mixup692' && score.word === 'rupee';
  });
  assertEquals(conditionsMet, true);
});

test(suite, 'invalid query params throw error', async () => {
  const response = await fetch(`${apiURL}/scores?invalid=query`);
  const json = await response.json();
  assertEquals(
    json.response,
    'Invalid query params. Allowed params are username, word or date'
  );
});

// ---------- ADDING SCORE ---------- //

test(suite, 'score adds successfully to db', async () => {
  const [score, word, username] = [2, 'choke', 'cranwell276'];

  // Add score to db
  const postRequest = await fetch(`${apiURL}/scores`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      score,
      word,
      username,
    }),
  });

  // Check if new score in db
  const postRequestJson = await postRequest.json();
  assertEquals(postRequestJson.response, 'score successfully added');

  // Delete test score from db
  const response = await fetch(`${apiURL}/scores`);
  const json = await response.json();
  const newScoreId = json.scores.find(
    (entry) => entry.username === username
  ).id;
  const deleteRequest = await fetch(`${apiURL}/scores/${newScoreId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  const deleteRequestJson = await deleteRequest.json();
  assertEquals(deleteRequestJson.response, 'score entry deleted');
});

test(suite, 'missing entry items throws error', async () => {
  const [score, word, username] = ['', '', 'cranwell276'];

  const postRequest = await fetch(`${apiURL}/scores`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      score,
      word,
      username,
    }),
  });

  const postRequestJson = await postRequest.json();
  assertEquals(
    postRequestJson.response,
    'Item(s) missing, need username, word and score for a valid request.'
  );
});
