const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const electronDb = low(adapter);

electronDb
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

const syncDatabase = async (win) => {
  setInterval(async () => {
    const stateFromLocal = JSON.parse(
      await win.webContents.executeJavaScript(
        `window.localStorage.getItem('db')`
      )
    );

    if (
      JSON.stringify(stateFromLocal.config) !==
      JSON.stringify(electronDb.config)
    ) {
      electronDb.set("config", stateFromLocal.config).write();
    }

    if (
      JSON.stringify(stateFromLocal.trades) !==
      JSON.stringify(electronDb.trades)
    ) {
      electronDb.set("trades", stateFromLocal.trades).write();
    }

    if (
      JSON.stringify(stateFromLocal.notifications) !==
      JSON.stringify(electronDb.notifications)
    ) {
      if (stateFromLocal.notifications.length === 0) {
        electronDb.set("notifications", []).write();
      }
      stateFromLocal.notifications.forEach((notif) => {
        if (!notif.sent) {
          const notix = electronDb
            .get("notifications")
            .find({ id: notif.id })
            .value();
          if (!notix) {
            electronDb.get("notifications").push(notif).write();
          }
        }
      });
    }
  }, 10000);
};

module.exports = { syncDatabase, electronDb };
