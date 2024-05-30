process.env.NODE_ENV = process.env.NODE_ENV || "development";

let envConfig;
const stage = process.env.STATE || "local";

if (stage === "production") {
  envConfig = import("./prod.js");
} else {
  envConfig = import("./local.js");
}

const defaultConfig = {
  stage,
  dbUrl: process.env.DB_URL,
  port: process.env.PORT,
};
