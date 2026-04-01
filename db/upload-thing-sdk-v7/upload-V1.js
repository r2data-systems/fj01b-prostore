import fs from "fs";
import path from "path";
import { createUploadthing, UTApi } from "uploadthing/server";

// Create UploadThing instance (core)
const f = createUploadthing();

// Initialize UploadThing API

//const utapi = new UTApi({
//  apiKey: process.env.UPLOADTHING_TOKEN,
//});

const utapi = new UTApi({
	token: process.env.UPLOADTHING_TOKEN
});

//const utapi = new UTApi({
//	apiKey: process.env.UPLOADTHING_SECRET,
//	appId: process.env.UPLOADTHING_APPID
//});

// Read JSON file
const data = JSON.parse(fs.readFileSync("./files.json", "utf-8"));

async function uploadFiles() {
  const results = [];

	let decoded = Buffer.from(process.env.UPLOADTHING_TOKEN, 'base64').toString('utf8');
	console.log("TOKEN",decoded);

	//decoded = Buffer.from(process.env.UPLOADTHING_SECRET, 'base64').toString('utf8');
	//console.log("SECRET",decoded);

  for (const filePath of data.files) {
    try {
      const absolutePath = path.resolve(filePath);

      // Read file buffer
      const fileBuffer = fs.readFileSync(absolutePath);

      // Create a File object (Node 18+ has Blob/File)
      const file = new File([fileBuffer], path.basename(filePath));

			console.log('PRE-utapi.uploadFiles --file',file);
			console.dir(file, { depth: null });

			// Upload to UploadThing
      const res = await utapi.uploadFiles([file]);

			console.log('POST-utapi.uploadFiles --res',file);
			console.dir(res, { depth: null });

			results.push({
        file: filePath,
        result: res,
      });

      console.log(`Uploaded: ${filePath}`);
    } catch (err) {
      console.error(`Failed: ${filePath}`, err);
    }
  }

  return results;
}

uploadFiles().then((res) => {
  console.log("All uploads complete:");
  console.dir(res, { depth: null });
});