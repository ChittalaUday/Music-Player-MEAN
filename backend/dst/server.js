"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
var cors = require('cors');
const db_1 = require("./config/db");
const app = (0, express_1.default)();
const PORT = 5000;
app.use(cors({
    origin: "http://localhost:4200", // Or use "*" for dev
    credentials: true
}));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use(userRoutes_1.default);
app.use(express_1.default.static('public'));
(0, db_1.connectDB)().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
}).catch((error) => {
    console.error("❌ Failed to connect to the database:", error);
});
