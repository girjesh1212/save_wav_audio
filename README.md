# Save Wav File
This repository demonstrate to record a wav audio file in html using RecordRTC followed by sending the audio chunks to server through socket and then uploading those audio chunks by part on AWS S3 bucket.

Note: Before running the project, please add your AWS credentials in config.env file.



## Why this code is important
I read a ton of articles and documentation on the internet but none of them exactly shows how to record and upload audio in parts.

There are examples of uploading a file by parts using fs module, there are examples of recording audio and uploading the entire audio as a single file, but none showed to record and simultaneously upload the audio in parts using AWS uploadPart functions.


## To run and test the project
- Clone this repository using *"git clone"*
- Paste your AWS credentials in config.env file
- Run *"npm install"* in your terminal to install the dependencies
- Run *"npm run start"* in the terminal to start the server