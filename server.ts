import { FastifySSEPlugin } from "fastify-sse-v2";
import path from "path";
import fastifyStatic from "@fastify/static";
const aedesPersistencelevel = require("aedes-persistence-level");
import fastify, { EventMessage, FastifyReply, FastifyRequest } from "fastify";
import Events from "events";
import { Level } from "level";

const server = fastify({ logger: false });
server.register(FastifySSEPlugin);

server.register(fastifyStatic, {
  root: path.join(__dirname),
  prefix: "/", // optional: default '/'
});

server.get("/ping", (req: FastifyRequest, res: FastifyReply) => {
  res.send("pong");
});
const SSEClients: { [k: string]: (source: EventMessage) => void } = {};

const ee = new Events.EventEmitter();
setInterval(() => {
  ee.emit("update", { data: "hello" });
}, 1000);

server.get("/stream/:clientId", function (req: FastifyRequest<{ Params: { clientId: string } }>, res: FastifyReply) {
  const clientId = req.params.clientId;
  SSEClients[clientId] = res.sse.bind(res);
  req.socket.on("close", function () {
    delete SSEClients[clientId];
  });
});
(function MQTT() {
  const aedesPersistencelevel = require("aedes-persistence-level");
  const port = 1883;
  const net = require("net");
  const A = require("aedes");
  const aedes = new A({
    // clean: false,
    // persistence: aedesPersistencelevel(new Level("./mydb")),
  });
  const server = net.createServer(aedes.handle);
  server.listen(port, () => {
    console.log("server listening on port", port);
  });

  aedes.on("clientError", (client, err) => {
    console.log("client error", client.id, err.message, err.stack);
  });
  aedes.on("publish", (packet, client) => {
    // if (client) {
    //   // console.log("message from client", client.id, packet.payload.toString());
    //   if (SSEClients[client.id]) {
    //     SSEClients[client.id]({
    //       data: packet.payload.toString(),
    //     });
    //   }
    // }
  });

  //  client.on('connect', function () {
  //     })

  aedes.on("client", (client) => {
    client.subscribe("hanoi", function (err) {
      if (!err) {
        console.log("Subscribed to myTopic");
      }
    });
    client.on("publish", function (packet) {
      console.log("Published", packet.payload.toString());
    });
  });
})();

server.listen({ port: 4000 }, () => {
  console.log("http://localhost:4000");
});
