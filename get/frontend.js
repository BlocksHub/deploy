const fs = require('fs-extra');
const path = require('path');
const rimraf = require('rimraf');
const crypto = require('crypto');
const cp = require('child_process');
const unzipper = require('unzipper');
let distPath = path.join(__dirname, '../web-frontend-dist');
if (fs.existsSync(distPath)) {
    rimraf.sync(distPath);
}
fs.mkdirSync(distPath);
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json')).toString());
const aws = require('aws-sdk');
const s3 = new aws.S3({
    endpoint: config.aws.endpoint,
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
});
let zipLocation = path.join(__dirname, '../tmp/', crypto.randomBytes(8).toString('hex') + '.zip');
const main = () => {
    let data = s3.getObject({
        Key: 'dist.zip',
        Bucket: 'web-frontend',
    });

    let d = data.createReadStream()
    let zip = fs.createWriteStream(zipLocation)
    zip.on('close', () => {
        let distPath = path.join(__dirname, '../web-frontend-dist/');
        console.log('read done. unzipping');
        fs.createReadStream(zipLocation).pipe(unzipper.Extract({ path: distPath })).on('close', () => {
            console.log('done unzip');
            fs.removeSync(zipLocation);

            let join = ';';
            if (process.platform === 'win32') {
                join = '&&';
            }
            cp.execSync(`cd ${distPath} ${join} npm install`);
        })
    })
    d.pipe(zip)
    console.log('piped');
}
main();