const AWS = require("aws-sdk");
const multer = require("multer");

const NAME_OF_BUCKET = process.env.S3_BUCKET;
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

// --------------------------- Public ------------------------

const singlePublicFileUpload = async (file) => {
  const { originalname, mimetype, buffer } = await file;
  const path = require("path");
  // name of the file in your S3 bucket will be the date in ms plus the extension name
  const Key = new Date().getTime().toString() + path.extname(originalname);
  const uploadParams = {
    Bucket: NAME_OF_BUCKET,
    Key,
    Body: buffer,
    ACL: "public-read",
  };
  const result = await s3.upload(uploadParams).promise();

  // save the name of the file in your bucket as the key in your database to retrieve for later
  return result.Location;
};

const multiplePublicFileUpload = async (files) => {
  return await Promise.all(
    files.map((file) => {
      return singlePublicFileUpload(file);
    })
  );
};

const singlePublicFileDelete = async (s3URL) => {
    let Key = s3URL.split("/");
    Key = Key[Key.length-1]

    const params = {
      Bucket: NAME_OF_BUCKET,
      Key
    };

    const result = await s3.deleteObject(params).promise();
    // return results of deletion from aws
    return result;
  };

  const multiplePublicFileDelete = async (urlArr) => {
    let keys = [];
    for (let url of urlArr){
        let key = url.split("/");
        key = key[key.length-1]
        keys.push({"Key" : key});
    }

    const params = {
      Bucket: NAME_OF_BUCKET,
      Delete: {
        Objects: keys
      }
    };

    const result = await s3.deleteObjects(params).promise();
    // return results of deletion from aws
    return result.Errors;
  };

// --------------------------- Prviate UPLOAD ------------------------

const singlePrivateFileUpload = async (file) => {
  const { originalname, mimetype, buffer } = await file;
  const path = require("path");
  // name of the file in your S3 bucket will be the date in ms plus the extension name
  const Key = new Date().getTime().toString() + path.extname(originalname);
  const uploadParams = {
    Bucket: NAME_OF_BUCKET,
    Key,
    Body: buffer,
  };
  const result = await s3.upload(uploadParams).promise();

  // save the name of the file in your bucket as the key in your database to retrieve for later
  return result.Key;
};

const multiplePrivateFileUpload = async (files) => {
  return await Promise.all(
    files.map((file) => {
      return singlePrivateFileUpload(file);
    })
  );
};

const retrievePrivateFile = (key) => {
  let fileUrl;
  if (key) {
    fileUrl = s3.getSignedUrl("getObject", {
      Bucket: NAME_OF_BUCKET,
      Key: key,
    });
  }
  return fileUrl || key;
};

// --------------------------- Storage ------------------------

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});

const singleMulterUpload = (nameOfKey) =>
  multer({ storage: storage }).single(nameOfKey);
const multipleMulterUpload = (nameOfKey) =>
  multer({ storage: storage }).array(nameOfKey);

module.exports = {
  s3,
  singlePublicFileUpload,
  multiplePublicFileUpload,
  singlePublicFileDelete,
  multiplePublicFileDelete,
  singlePrivateFileUpload,
  multiplePrivateFileUpload,
  retrievePrivateFile,
  singleMulterUpload,
  multipleMulterUpload,
};
