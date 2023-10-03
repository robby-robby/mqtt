import { MemoryLevel } from "memory-level";
import { Level } from "level";

export class MainSubDB {
  constructor(public db: Level | MemoryLevel, private name?: string) {
    if (name == null) this.name = this.constructor.name;
    this.db.setMaxListeners(Infinity);
  }
  //weak-random to avoid Date.now() collisions
  #randomID() {
    return (Math.random() + 1).toString(36).slice(2);
  }
  static END_C = "\xff";
  #subID() {
    const uuid = this.#randomID();
    //Date.now for insertion order
    return `${Date.now()}-${uuid}`;
  }
  #mainRange(mainID: string) {
    return [this.#mainKey(mainID), this.#mainKeyEnd(mainID)];
  }
  #dbRange() {
    return [this.#dbKey(), this.#dbKeyEnd()];
  }
  #dbKey() {
    return `${this.name}:`;
  }
  #dbKeyEnd() {
    return this.#dbKey() + MainSubDB.END_C;
  }

  watchPut(mainID: string, cb: (key: string, value: string) => void) {
    return this.watch("put", mainID, cb);
  }

  watch(action: "put", mainID: string, cb: (key: string, value: string) => void) {
    const watcher = (key: string, value: string) => {
      if (key == this.#mainKey(mainID)) {
        cb(key, value);
      }
    };
    this.db.addListener(action, watcher);
    return () => this.db.removeListener(action, watcher);
  }

  #mainKey(mainID: string) {
    return `${this.#dbKey()}${mainID}:`;
  }
  #subKey(mainID: string, subID: string) {
    return `${this.#mainKey(mainID)}${subID}`;
  }
  #mainKeyEnd(mainID: string) {
    return this.#mainKey(mainID) + MainSubDB.END_C;
  }
  #serialize<T extends object>(data: T) {
    return JSON.stringify(data); //msgpack?
  }
  get _db() {
    return this.db as Level;
  }

  async dropMain(mainID: string) {
    const [start, end] = this.#mainRange(mainID);
    for await (const [key] of this._db.iterator({ gt: start, lt: end })) {
      await this.db.del(key);
    }
  }
  async dropDb() {
    for await (const [key] of this.fetchAllDb()) {
      await this.db.del(key);
    }
  }
  async put<T extends object>(id: string, data: T) {
    const dataStr = this.#serialize<T>(data);
    const subId = this.#subID();
    await this.db.put(this.#subKey(id, subId), dataStr);
    return subId;
  }

  getMain(id: string, subId: string) {
    return this.db.get(this.#subKey(id, subId));
  }
  fetchAllMain(id: string) {
    const [start, end] = this.#mainRange(id);
    return this._db.iterator({ gt: start, lt: end });
  }
  fetchAllDb() {
    const [start, end] = this.#dbRange();
    return this._db.iterator({ gt: start, lt: end });
  }
}

//ChatDB:myChatId000:1696289323396-6bbc3a
//<DB>:<MainID>:<SubID (Date.now-Weak Random) >
//Sub is non deterministic
// (async function main() {
//   class ChatDB extends MainSubDB {}

//   const db = new MemoryLevel(); //Level("./db");
//   const chatdb = new ChatDB(db as Level);
//   await chatdb.dropDb();
//   const chatId = "myChatId000";

//   await Promise.all([
//     chatdb.put(chatId, { data: "x_hello_A" }),
//     chatdb.put(chatId, { data: "x_hello_B" }),
//     chatdb.put(chatId, { data: "x_hello_C" }),
//     chatdb.put(chatId, { data: "x_hello_D" }),
//   ]);

//   // console.log(`message id: ${msgId}`);
//   // const message = await chatdb.get(chatId, msgId);
//   for await (const [k, v] of chatdb.fetchAllMain(chatId)) {
//     console.log(">", k, v);
//   }
// })();
