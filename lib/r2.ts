import { createHash, createHmac } from "crypto";

const REGION = "auto";
const SERVICE = "s3";

type R2Config = {
  accountId: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl: string;
  apiHost: string;
};

type PutObjectParams = {
  key: string;
  body: Uint8Array;
  contentType: string;
};

const getR2Config = (): R2Config => {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const bucketName = process.env.R2_BUCKET_NAME?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();

  if (!accountId || !bucketName || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing R2 configuration.");
  }

  const publicBaseUrl = (process.env.R2_PUBLIC_BASE_URL?.trim()
    || `https://${bucketName}.${accountId}.r2.dev`);
  const apiHost = (process.env.R2_API_HOST?.trim()
    || `${accountId}.r2.cloudflarestorage.com`);

  return {
    accountId,
    bucketName,
    accessKeyId,
    secretAccessKey,
    publicBaseUrl,
    apiHost
  };
};

const hashSha256 = (payload: Buffer | Uint8Array | string) =>
  createHash("sha256").update(payload).digest("hex");

const hmacSha256 = (key: Buffer | string, payload: string) =>
  createHmac("sha256", key).update(payload).digest();

const toAmzDate = (date: Date) => date.toISOString().replace(/[:-]|\.\d{3}/g, "");

const encodeUriPath = (path: string) =>
  path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

export const putObjectToR2 = async ({ key, body, contentType }: PutObjectParams) => {
  const { accessKeyId, secretAccessKey, publicBaseUrl, apiHost, bucketName } = getR2Config();

  const method = "PUT";
  const now = new Date();
  const amzDate = toAmzDate(now);
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = hashSha256(body);
  const canonicalUri = `/${encodeUriPath(bucketName)}/${encodeUriPath(key)}`;

  const canonicalHeaders = [
    `host:${apiHost}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`
  ].join("\n") + "\n";

  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";

  const canonicalRequest = [
    method,
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join("\n");

  const credentialScope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    hashSha256(canonicalRequest)
  ].join("\n");

  const kDate = hmacSha256(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = hmacSha256(kDate, REGION);
  const kService = hmacSha256(kRegion, SERVICE);
  const kSigning = hmacSha256(kService, "aws4_request");
  const signature = createHmac("sha256", kSigning).update(stringToSign).digest("hex");

  const authorization = [
    "AWS4-HMAC-SHA256 Credential=",
    `${accessKeyId}/${credentialScope}`,
    ", SignedHeaders=",
    signedHeaders,
    ", Signature=",
    signature
  ].join("");

  const response = await fetch(`https://${apiHost}${canonicalUri}`, {
    method,
    headers: {
      Authorization: authorization,
      "Content-Type": contentType,
      "Content-Length": body.byteLength.toString(),
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate
    },
    body
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`R2 upload failed: ${response.status} ${responseText}`);
  }

  return {
    publicUrl: `${publicBaseUrl}/${key}`
  };
};
