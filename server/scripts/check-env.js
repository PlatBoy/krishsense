process.env.NODE_ENV = process.env.NODE_ENV || "production";
const { assertProductionEnv } = await import("../config/env.js");
assertProductionEnv();
console.log("Required production environment variables are present.");
