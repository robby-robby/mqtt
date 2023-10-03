"use strict";
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fastify_sse_v2_1 = require("fastify-sse-v2");
// import path from "path";
var static_1 = require("@fastify/static");
var fastify_1 = require("fastify");
// import { EventEmitter } from "events";
// import net from "net";
// import { Level } from "level";
// import aedesPersistencelevel from "aedes-persistence-level";
// import Aedes from "aedes";
var server = (0, fastify_1.default)();
server.register(fastify_sse_v2_1.FastifySSEPlugin);
// const port = 1883;
// const aedes = new Aedes({
//   persistence: aedesPersistencelevel(new Level("./mydb")),
// });
// const aedesServer = net.createServer(aedes.handle);
// aedesServer.listen(port, () => {
//   console.log("server listening on port", port);
// });
// aedes.on("clientError", (client, err) => {
//   console.log("client error", client.id, err.message, err.stack);
// });
// aedes.on("publish", (packet, client) => {
//   if (client) {
//     console.log("message from client", client.id, packet.payload.toString());
//     if (sseClients[client.id]) {
//       sseClients[client.id].write({
//         data: packet.payload.toString(),
//         event: "message",
//       });
//     }
//   }
// });
// aedes.on("client", (client) => {
//   console.log("new client", client.id);
// });
var sseClients = {};
sseClients["mystream"] = [];
server.register(static_1.default, {
    // root: path.join(__dirname),
    root: ".",
    prefix: "/", // optional: default '/'
});
server.get("/foo", function (req, res) {
    res.status(200);
    res.send("foo");
});
server.get("/stream", function (req, res) {
    var id = req.params.clientId;
    // if (sseClients[id] === undefined) {
    //   return res.status(404);
    // }
    res.sse((function source() {
        var _a;
        return __asyncGenerator(this, arguments, function source_1() {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!((_a = sseClients[id]) !== null && _a !== void 0 ? _a : []).length) return [3 /*break*/, 3];
                        return [4 /*yield*/, __await({ data: "foo" })];
                    case 1: return [4 /*yield*/, _b.sent()];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 0];
                    case 3: return [2 /*return*/];
                }
            });
        });
    })());
});
var id = 0;
setInterval(function () {
    sseClients["mystream"].unshift(id++);
}, 1000);
server.listen({ port: 4000 });
