import fastify, { FastifyRequest } from "fastify";

import { MemoryLevel } from "memory-level";
import { EventEmitter } from "stream";
import { MainSubDB } from "./MainSubDB";

import { FastifySSEPlugin } from "fastify-sse-v2";

/*
 *
 * /messages/:id
 * - Send a message to a chat
 *
 * /stream/:id
 * - Stream returns an SSE stream of messages in the shape of
 *  { id: string, data: string }
 *
 */

// const leveldb = new Level("./chatdb");
const leveldb = new MemoryLevel();

class StreamDB extends MainSubDB {
  stream(chatID: string) {
    return this.fetchAllMain(chatID);
  }
}

//syntax sugar
class ChatDB extends MainSubDB {
  watchMsgs(chatID: string, cb: (key: string, value: string) => void) {
    const close = this.watchPut(chatID, cb);
    return close;
  }
  messages(chatID: string) {
    return this.fetchAllMain(chatID);
  }
  addMessage(chatID: string, msg: string) {
    return this.put(chatID, { data: msg });
  }
}
const cdb = new ChatDB(leveldb);

const app = fastify({ logger: false });
app.register(FastifySSEPlugin);
// Get all messages from chat :id
app.get("/chat/:id", async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
  const { id } = req.params;
  const messages = await cdb.messages(id);
  res.send(messages);
});

app.post("/chat/:id", async (req: FastifyRequest<{ Params: { id: string }; Body: { data: { msg: string } } }>, res) => {
  const { id } = req.params;
  const {
    data: { msg },
  } = req.body;
  const msgId = await cdb.addMessage(id, msg);
  res.status(201).send({ id: msgId });
});

// Live SSE stream for chat :id
app.get("/stream/:id", async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
  const { id } = req.params;
  const close = cdb.watchMsgs(id, (key, value) => {
    res.sse({ id: key, data: value });
  });
  req.socket.on("close", close);
});

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
