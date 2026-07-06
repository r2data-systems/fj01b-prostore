import fs from "fs";
import path from "path";
import { UTApi } from "uploadthing/server";

// Initialize UploadThing API
const utapi = new UTApi({
	token: process.env.UPLOADTHING_TOKEN
});

// Read JSON file
//const data = JSON.parse(fs.readFileSync("./files.json", "utf-8"));

async function uploadFilesAsString(filePath: string) {
	try {
		const absolutePath = path.resolve(filePath);

		// Read file buffer
		const fileBuffer = fs.readFileSync(absolutePath);

		// Create a File object (Node 18+ has Blob/File)
		const file = new File([fileBuffer], path.basename(filePath));

		// Upload to UploadThing
		const res = await utapi.uploadFiles([file]);
		const fileUrl = res[0].data?.url;
		if (fileUrl === undefined) {
			throw new Error('UNDEFINED')
		}

		console.log(`Uploaded: ${filePath}`);
		console.log(fileUrl);

		//results.push(fileUrl);
		return fileUrl;

	} catch (err) {
		console.error(`Failed: ${filePath}`, err);

		return 'ERROR';
	}
}

/**
 * @param {string | string[]} data
 */
async function uploadFilesV2(data: string | string[]): Promise<string | string[]> {
	let workingData: string[] = [];
  const results = [];
	
	if (typeof data === "string") {
    // handle string
		workingData = [data];
  } else {
		workingData = data;
	}

  for (const filePath of workingData) {
    //try {
    //  const absolutePath = path.resolve(filePath);

    //  // Read file buffer
    //  const fileBuffer = fs.readFileSync(absolutePath);

    //  // Create a File object (Node 18+ has Blob/File)
    //  const file = new File([fileBuffer], path.basename(filePath));

		//	// Upload to UploadThing
    //  const res = await utapi.uploadFiles([file]);
		//	const fileUrl = res[0].data?.url;

		//	console.log(fileUrl);
		//	results.push(fileUrl);

    //  console.log(`Uploaded: ${filePath}`);
    //} catch (err) {
    //  console.error(`Failed: ${filePath}`, err);
    //}
		const fileURL = await uploadFilesAsString(filePath);
		results.push(fileURL);
  }

  //return results;
	if (typeof data === "string") {
		return results[0];
	} else {
		return results;
	}
}

export async function uploadImagesV2(data: string[]) {
  const results = [];
	let fileURL = '';
	
  //for (const filePath of data) {
	//	await uploadFilesAsString(filePath).then((x) => {
	//		fileURL = x;
	//	});
	//	results.push(fileURL);
  //}

	for (const filePath of data) {
		fileURL = await uploadFilesAsString(filePath);
		results.push(fileURL);
  }

	return results;
}

export async function uploadBannerV2(data: string) {
	let fileURL = '';
	
	//await uploadFilesAsString(data).then((x) => {
	//	fileURL = x;
	//});

	fileURL = await uploadFilesAsString(data);

	return fileURL;
}