// Demo sample using ABBYY Cloud OCR SDK from Node.js

if (((typeof process) == 'undefined') || ((typeof window) != 'undefined')) {
	throw new Error("This code must be run on server side under NodeJS");
}

//!!! Please provide your application id and password and remove this line !!!
// To create an application and obtain a password,
// register at http://cloud.ocrsdk.com/Account/Register
// More info on getting your application id and password at
// http://ocrsdk.com/documentation/faq/#faq3

// Name of application you created
const appId = 'TestTestTestTest222';
// Password should be sent to your e-mail after application was created
const password = 'cO5uwvgQPvaxiGrovu7yJ1lt';

const imagePath = 'c:\\work\\abbyy\\ABBYY_CLOUD_OCR_JS\\9508034383445028.jpg';
const xmlPath = 'c:\\work\\abbyy\\ABBYY_CLOUD_OCR_JS\\taskTemplate.xml';
const outputPath = 'C:\\work\\abbyy\\ABBYY_CLOUD_OCR_JS\\result_js.json';

function recognize(imagePath) {
	var Promise = require('es6-promise').Promise;

	return new Promise(function(resolve, reject) {
		try {
			console.log("ABBYY Cloud OCR SDK Sample for Node.js");

			const ocrsdkModule = require('./ocrsdk.js');
			const ocrsdk = ocrsdkModule.create(appId, password);
			ocrsdk.serverUrl = "https://cloud.ocrsdk.com"; // change to https for secure connection

			if (appId.length === 0 || password.length === 0) {
				reject(new Error("Please provide your application id and password!"));
			}

			if( imagePath == 'myFile.jpg') {
				reject(new Error( "Please provide path to your image!"));
			}

			function downloadCompleted(error, data) {
				if (error) {
					console.log("Error: " + error.message);
					reject(data);
				}
				console.log("Done.");
				resolve(data);
			}

			function processingCompleted(error, taskData) {
				if (error) {
					console.log("Error: " + error.message);
					reject(error);
				}

				if (taskData.status != 'Completed') {
					console.log("Error processing the task.");
					if (taskData.error) {
						console.log("Message: " + taskData.error);
					}
					reject(taskData.error);
				}

				console.log("Processing completed.");
				console.log("Downloading result to " + outputPath);

				ocrsdk.downloadResult(taskData.resultUrl.toString(), outputPath,
						downloadCompleted);
			}

			function processCompleted(error, taskData) {
				if (error) {
					console.log("Error: " + error.message);
					reject(error);
				}

				console.log("Upload xml completed.");
				console.log("Task id = " + taskData.id + ", status is " + taskData.status);
				if (!ocrsdk.isTaskActive(taskData)) {
					console.log("Unexpected task status " + taskData.status);
					reject(taskData.status);
				}

				ocrsdk.waitForCompletion(taskData.id, processingCompleted);
			}

			function submitCompleted(error, taskData) {
				if (error) {
					console.log("Error: " + error.message);
					reject(error);
				}

				console.log("Upload image completed.");
				console.log("Task id = " + taskData.id + ", status is " + taskData.status);

				ocrsdk.processFields(xmlPath, taskData.id, processCompleted);
			}

			console.log("Uploading image..");
			ocrsdk.submitImage(imagePath, submitCompleted);

		} catch (err) {
			console.log("Error: " + err.message);
			reject(err);
		}
	});
}

recognize(imagePath)
	.then(function(data) {
		console.log(data);
	})
	.catch(function(err) {
		console.log(err)
	});
