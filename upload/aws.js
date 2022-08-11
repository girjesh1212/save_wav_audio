
var getFileHeaders = require('wav-headers');
const { createPartUpload, uploadPart, completeMultipartUpload } = require(__dirname + '/multipart');

module.exports.onConnect = ({ key, extension }) => {
    createPartUpload(key, extension).then(() => {
        console.log('Initialised');
        return;
    });
}

module.exports.onPart = ({ key, data }) => {

    var obj = kMap[key];
    const chunk = Buffer.from(data);

    obj.buffer.push(chunk);
    obj.size += Buffer.byteLength(chunk) / 1000000;
    obj.totalSize += Buffer.byteLength(chunk);

    console.log(obj.size);

    if (obj.size >= 10) {
        obj.partNum += 1;
        var data = Buffer.concat(obj.buffer);
        obj.buffer = [];
        obj.size = 0;
        console.log('Uploading part: ' + obj.partNum);
        const p = uploadPart(key, data, obj.partNum);
        obj.promises.push(p);
    }
    return;
}

module.exports.onDisconnect = async ({ key, channels, sampleRate, bitDepth }) => {
    console.log('on Disconnect called');
    return new Promise((resolve) => {
        const obj = kMap[key];
        Promise.all(obj.promises).then(async (messages) => {

            var options = {
                channels: channels,
                sampleRate: sampleRate,
                bitDepth: bitDepth,
                dataLength: obj.totalSize,
            };
            var headersBuffer = getFileHeaders(options);

            var data = Buffer.concat(obj.buffer);
            data = Buffer.concat([headersBuffer, data]);
            console.log('Uploading part: 1');
            await uploadPart(key, data, 1);
            const result = await completeMultipartUpload(key);
            delete kMap[key];
            resolve(result);

        });
    });

}
