import app from "../app";
import { DbConnector } from "../config/dbConnector";
import { setupFacade } from "../graphql/resolvers";

const debug = require("debug")("www");
const PORT = process.env.PORT || 3333;

(async function connectToDb() {
  const connection = await DbConnector.connect();
  const db = connection.db(process.env.DB_NAME);
  app.set("db", db);
  app.set("db-type", "REAL");
  app.listen(PORT, () => debug(`Server started, listening on PORT: ${PORT}`));
  setupFacade(db);
})();
