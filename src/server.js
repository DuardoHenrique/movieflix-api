"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var port = 3000;
var app = (0, express_1.default)();
app.get("/", function (req, res) {
    res.send("Home page");
});
app.listen(port, function () {
    console.log("Servidor em execu\u00E7\u00E3o na porta http://localhost:".concat(port));
});
