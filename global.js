// <---------------------------- Global objects ---------------------------->
var AWS = require('aws-sdk');


// Global S3 instance
global.kS3Instance = new AWS.S3({
    region: process.env.AWS_BUCKET_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
});


// Global S3 map
global.kMap = {};
