const { v4: uuid } = require('uuid');       // generates random strings
uuid();


// Step 1: Create multipart Upload instance
module.exports.createPartUpload = (key, extension) => {
    console.log('Initialising part upload');
    console.log('Please wait...');
    const promise = new Promise((resolve, reject) => {
        const fileName = `${uuid()}.${extension}`;
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            ACL: 'public-read',
            ContentType: `audio/${extension}`
        };

        kS3Instance.createMultipartUpload(params, (err, multipartResult) => {
            if (err) {
                reject(err);
            } else {
                kMap[key] = {
                    buffer: [],
                    size: 0,
                    totalSize: 0,
                    partNum: 1,
                    promises: [],
                    file: {
                        fileName: fileName,
                        result: multipartResult,
                        parts: [],                  // To store ETags
                    }
                }
                resolve();
            }
        });
    });
    return promise;
}

// Step 2: Upload a buffer
module.exports.uploadPart = (key, data, partNum) => {

    return new Promise((resolve, reject) => {
        var obj = kMap[key];
        const params = {
            Body: data,
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: obj.file.fileName,
            PartNumber: partNum,
            UploadId: obj.file.result.UploadId
        };

        kS3Instance.uploadPart(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                obj.file.parts.push({
                    ETag: data.ETag,
                    PartNumber: partNum,
                });
                console.log('Uploaded part ' + partNum);
                resolve();
            }
        });
    });
}

// Step 3: Complete multipart upload
module.exports.completeMultipartUpload = async (key) => {
    var multipartResult = kMap[key].file;
    if (multipartResult == null || multipartResult == undefined) {
        return;
    }
    const sortedArray = await sort(multipartResult.parts);
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: multipartResult.fileName,
            MultipartUpload: { Parts: sortedArray },
            UploadId: multipartResult.result.UploadId,
        };

        kS3Instance.completeMultipartUpload(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                console.log('File uploaded successfully');
                resolve(data);
            }
        });

    });
}


const sort = (arr) => {
    return new Promise((resolve, reject) => {
        var out = [];
        if (arr.length == 0) {
            resolve(out);
        } else if (arr.length == 1) {
            out[0] == arr[0];
            resolve(out);
        }

        out.push(arr[0]);
        for (let i = 1; i < arr.length; i++) {
            var j = 0;
            while (arr[i].PartNumber >= out[j].PartNumber) {
                j++;
                if (j == out.length) {
                    break;
                }
            }
            if (j < out.length) {
                out.splice(j, 0, arr[i]);
            } else {
                out.push(arr[i]);
            }
        }
        // console.log(out);
        resolve(out);
    })
}
