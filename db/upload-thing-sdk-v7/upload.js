import fs from "fs";
import path from "path";
import { UTApi } from "uploadthing/server";

// Initialize UploadThing API
const utapi = new UTApi({
  token: process.env.UPLOADTHING_TOKEN,
});

async function uploadFiles(filePath) {
  const results = [];

  //const filePath = "./README.txt";
  console.log(filePath);

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

  return results;
}

export default uploadFiles;

//uploadFiles().then((res) => {
//  console.dir(res, { depth: null });
//});
