const decodedToken = Buffer.from(process.env.UPLOADTHING_TOKEN, 'base64').toString('utf8');
console.log("TOKEN",decodedToken);

//const decodedSecret = Buffer.from(process.env.UPLOADTHING_SECRET, 'base64').toString('utf8');
//console.log("SECRET",decodedSecret);