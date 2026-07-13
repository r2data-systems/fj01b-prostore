//import 'dotenv/config';

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, ".env"),
  override: true,
});

console.log("UPLOADTHING_APP_ID",process.env.UPLOADTHING_APP_ID);

console.log("UPLOADTHING_TOKEN",process.env.UPLOADTHING_TOKEN);
const decodedToken = Buffer.from(process.env.UPLOADTHING_TOKEN, 'base64').toString('utf8');
console.log("TOKEN",decodedToken);

//const decodedSecret = Buffer.from(process.env.UPLOADTHING_SECRET, 'base64').toString('utf8');
//console.log("SECRET",decodedSecret);