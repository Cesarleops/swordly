"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const controllers_1 = require("./links/controllers");
const controllers_2 = require("./users/controllers");
exports.router = (0, express_1.Router)();
//Links
exports.router.get("/links/:id", controllers_1.getSingleLink);
exports.router.get("/links", controllers_1.getAllLinks);
exports.router.post("/links", controllers_1.createLink);
exports.router.put("/links", controllers_1.editLink);
exports.router.delete("/links", controllers_1.deleteLink);
//Users
exports.router.post("/user", controllers_2.createUser);
