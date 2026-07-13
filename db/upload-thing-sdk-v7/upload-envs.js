import 'dotenv/config';

console.log("UPLOADTHING_APP_ID",process.env.UPLOADTHING_APP_ID);

console.log("UPLOADTHING_TOKEN",process.env.UPLOADTHING_TOKEN);
const decodedToken = Buffer.from(process.env.UPLOADTHING_TOKEN, 'base64').toString('utf8');
console.log("TOKEN",decodedToken);

//const decodedSecret = Buffer.from(process.env.UPLOADTHING_SECRET, 'base64').toString('utf8');
//console.log("SECRET",decodedSecret);