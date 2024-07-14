import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  GetObjectCommandOutput,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'node:stream';

const client = new S3Client();

export const getUrl = async (bucket: string, key: string): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: 'text/csv',
  });
  return await getSignedUrl(client, command, { expiresIn: 120 });
};

export const getReadableStreamFromBucketFile = async (
  bucket: string,
  key: string
): Promise<Readable> => {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = (await client.send(command)) as GetObjectCommandOutput & {
    Body: Readable;
  };

  if (!response.Body) {
    throw new Error(key);
  }

  return response.Body;
};

export const moveFileBetweenBucketFolders = async (
  bucket: string,
  srcPath: string,
  destPath: string
) => {
  await client.send(
    new CopyObjectCommand({
      CopySource: `/${bucket}/${srcPath}`,
      Bucket: bucket,
      Key: destPath,
    })
  );

  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: srcPath }));
};

export const listObjects = async(bucketName: string) => {
  const listBucketObjectsCmd = new ListObjectsV2Command({
    Bucket: bucketName,
    // The default and maximum number of keys returned is 1000. This limits it to
    // one for demonstration purposes.
    MaxKeys: 100,
  });

  let isTruncated = true;

  console.log('Your bucket contains the following objects:\n');
  let contents = '';

  while (isTruncated) {
    const { Contents, IsTruncated, NextContinuationToken } =
      await client.send(listBucketObjectsCmd);
    const contentsList = Contents?.map((c) => ` • ${c.Key}`).join('\n') || '';
    contents += contentsList + '\n';
    isTruncated = IsTruncated || false;
    listBucketObjectsCmd.input.ContinuationToken = NextContinuationToken;
  }
  console.log(contents);
}
