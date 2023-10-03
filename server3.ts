// Import Fastify and Fastify-SSE-v2
import Fastify, { FastifyInstance, RouteShorthandOptions } from "fastify";
import fastifySseV2 from "fastify-sse-v2";

// Create Fastify instance
const fastify: FastifyInstance = Fastify();

// Register Fastify-SSE-v2
fastify.register(fastifySseV2);

// Define a route for SSE
const opts: RouteShorthandOptions = {
  schema: {
    response: {
      200: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "number" },
            data: { type: "string" },
          },
        },
      },
    },
  },
};

fastify.get("/stream", opts, async (request, reply) => {
  reply.sse(
    (async function* () {
      for (let i = 0; i < 10; i++) {
        // Emit an event every second
        await new Promise((resolve) => setTimeout(resolve, 1000));
        yield { id: Date.now(), data: `Event number ${i}` };
      }
    })()
  );
});

// Start the server
fastify.listen(3000, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server is running at ${address}`);
});
