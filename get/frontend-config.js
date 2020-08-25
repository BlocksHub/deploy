const fs = require('fs-extra');
const path = require('path');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json')).toString());
const aws = require('aws-sdk');
const s3 = new aws.S3({
    endpoint: config.aws.endpoint,
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
});
let fLocation = path.join(__dirname, '../web-frontend-dist/config.json');
const main = () => {
    s3.getObject({
        Key: 'config.json',
        Bucket: 'web-frontend',
    }, (err, data) => {
        if (err) {
            return console.error(err);
        }
        let b = data.Body;
        fs.writeFileSync(fLocation, b);
    });
}
main();