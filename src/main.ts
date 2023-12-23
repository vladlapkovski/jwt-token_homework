import { appStart } from "./app";
import dotenv from "dotenv";
import { runDb } from "./db";

dotenv.config();
const app = appStart();
const port = process.env.PORT || 3000;

const startOFapp = async () => {
  await runDb();
  app.listen(port, () => {
    console.log(`Приложение прослушивает порт: ${port}`);
  });
};

startOFapp();