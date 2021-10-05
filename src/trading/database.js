import low from "lowdb";
import LocalStorage from "lowdb/adapters/LocalStorage";

const adapter = new LocalStorage("db");

const botDatabase = low(adapter);

botDatabase
  .defaults({
    trades: [],
    config: {
      infuraId: "",
      privatekey: "",
    },
    chatIds: [],
    notifications: [],
  })
  .write();

export { botDatabase };
