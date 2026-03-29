import uploadFiles from './upload-thing-sdk-v7/upload-V2.js';

//const file = "./README.txt";

//const data = {[
//	"./README.txt", 
//	//"../../../resources/images/sample-products/p1-1.jpg",
//	//"/home/feddev/projects/fj-shopping-platform/resources/images/sample-products/p1-2.jpg"
//]}

const data = {
  "files": [
		"./README.txt", 
		//"../../../resources/images/sample-products/p1-1.jpg",
		//"/home/feddev/projects/fj-shopping-platform/resources/images/sample-products/p1-2.jpg"
		]
}

function main() {
	uploadFiles(data).then((res) => {
		console.dir(res, { depth: null });
	});
}

main();
