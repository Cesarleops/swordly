"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router_1 = require("./src/router");
const app = (0, express_1.default)();
const PORT = 3000;
app.use("/api", router_1.router);
app.listen(PORT, () => {
    console.log("Hey! Server just started");
});
