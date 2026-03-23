import fs from "fs";
import path from "path";
import { createUploadthing, UTApi } from "uploadthing/server";

// Initialize UploadThing API
const utapi = new UTApi({
  apiKey: process.env.UPLOADTHING_SECRET,
});

// Read JSON file
const data = JSON.parse(fs.readFileSync("./files.json", "utf-8"));

async function uploadFiles() {
  const results = [];

  for (const filePath of data.files) {
    try {
      const absolutePath = path.resolve(filePath);

      // Read file buffer
      const fileBuffer = fs.readFileSync(absolutePath);

      // Create a File object (Node 18+ has Blob/File)
      const file = new File([fileBuffer], path.basename(filePath));

      // Upload to UploadThing
      const res = await utapi.uploadFiles([file]);

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