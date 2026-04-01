import fs from "fs";
import path from "path";
import { UTApi } from "uploadthing/server";

// Initialize UploadThing API
const utapi = new UTApi({
	token: process.env.UPLOADTHING_TOKEN
});

// Read JSON file
//const data = JSON.parse(fs.readFileSync("./files.json", "utf-8"));

//const basePath = '/home/feddev/projects/fj-shopping-platform/resources';

async function uploadFilesV2(data) {
  const results = [];

  for (const filePath of data) {
    try {
      const absolutePath = path.resolve(filePath);

      // Read file buffer
      const fileBuffer = fs.readFileSync(absolutePath);

      // Create a File object (Node 18+ has Blob/File)
      const file = new File([fileBuffer], path.basename(filePath));

			// Upload to UploadThing
      const res = await utapi.uploadFiles([file]);
			const fileUrl = res[0].data?.url;

			console.log(fileUrl);

			//results.push({
      //  file: filePath,
      //  result: fileUrl,
      //});

			results.push(fileUrl);

      console.log(`Uploaded: ${filePath}`);
    } catch (err) {
      console.error(`Failed: ${filePath}`, err);
    }
  }

  return results;
}

export default uploadFilesV2;