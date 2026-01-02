const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const config = require('../config/env');

const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET || process.env.ASSET_R2_BUCKET;
const endpoint = process.env.R2_ENDPOINT || process.env.ASSET_R2_ENDPOINT || undefined;

let s3 = null;
if (accessKeyId && secretAccessKey && bucket) {
  s3 = new S3Client({
    region: 'auto',
    endpoint: endpoint || undefined,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: false
  });
}

const contentTypeFromExt = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.avif':
      return 'image/avif';
    case '.webp':
      return 'image/webp';
    case '.mp4':
      return 'video/mp4';
    case '.webm':
      return 'video/webm';
    case '.glb':
      return 'model/gltf-binary';
    case '.gltf':
      return 'model/gltf+json';
    default:
      return 'application/octet-stream';
  }
};

async function uploadFile(localPath, key) {
  if (!s3) {
    throw new Error('S3/R2 client not configured (missing credentials or bucket)');
  }

  const body = fs.createReadStream(localPath);
  const contentType = contentTypeFromExt(localPath);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key.replace(/^\/+/, ''),
    Body: body,
    ContentType: contentType
  });

  await s3.send(command);

  // Build public URL from configured assetBaseUrl if available, otherwise try endpoint
  const base = config.assetBaseUrl || (endpoint ? endpoint.replace(/\/$/, '') : undefined);
  if (base) {
    return encodeURI(`${base}/${key.replace(/^\/+/, '')}`);
  }

  // Fallback URL pattern for R2-style endpoints
  if (endpoint) {
    return encodeURI(`${endpoint.replace(/\/$/, '')}/${bucket}/${key.replace(/^\/+/, '')}`);
  }

  return null;
}

module.exports = { uploadFile };
