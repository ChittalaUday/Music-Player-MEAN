import express,{ Request,Response } from "express";
import router from "./routes/userRoutes";
import admin from "./config/firebase"
var cors = require('cors');
import {connectDB} from "./config/db"

const app = express(); 
const PORT = 5000;


app.use(cors({
  origin: "http://localhost:4200", // Or use "*" for dev
  credentials: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(router);
app.use(express.static('public'));

connectDB().then(()=>{
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
}).catch((error) => {
    console.error("❌ Failed to connect to the database:", error);

});
