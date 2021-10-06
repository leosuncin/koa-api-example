import { cleanEnv, port, str } from "envalid";
import process from "node:process";

const environment = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "production", "test"],
    default: "development",
  }),
  PORT: port({ default: 3000 }),
});

export default environment;
