const { Level } = require("level");
const fastify = require("fastify");
const ssePlugin = require("fastify-sse-v2").default;
const path = require("path");
const staticPlugin = require("fastify-static");

function MQTT() {
  const aedesPersistencelevel = require("aedes-persistence-level");
  const port = 1883;
  const net = require("net");
  const A = require("aedes");
  const aedes = new A({
    persistence: aedesPersistencelevel(new Level("./mydb")),
  });
  const server = net.createServer(aedes.handle);
  server.listen(port, () => {
    console.log("server listening on port", port);
  });

  aedes.on("clientError", (client, err) => {
    console.log("client error", client.id, err.message, err.stack);
  });
  aedes.on("publish", (packet, client) => {
    if (client) {
      console.log("message from client", client.id, packet.payload.toString());
      if (sseClients[client.id]) {
        sseClients[client.id].write({
          data: packet.payload.toString(),
          event: "message",
        });
      }
    }
  });

  aedes.on("client", (client) => {
    console.log("new client", client.id);
  });
}

let sseClients = {};

// Setup fastify
const app = fastify();

app.register(ssePlugin);

app.route({
  method: "GET",
  url: "/stream/:clientId",
  handler: (req, reply) => {
    reply.sse(
      (async function* () {
        sseClients[req.params.clientId] = this;
      })()
    );
  },
});

// Serve static files
app.register(staticPlugin, {
  root: path.join(__dirname),
  prefix: "/", // optional: default '/'
});

app.listen(3000, () => {
  console.log("Fastify server listening on port 3000");
});
