import * as dotenv from 'dotenv';
import path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  bucketName: 'import-service-01', // name must be unique for all AWS!
  uploadPath: 'uploaded',
  parsedPath: 'parsed',
  topicName: 'createProductTopic',
  emails: {
    importSuccess: process.env.CDK_EMAIL_IMPORT_SUCCESS ?? '',
    imporLongQueue: process.env.CDK_EMAIL_IMPORT_OVERLENGTH ?? '',
  },
  productTableName: 'Products',
  stockTableName: 'Stocks',
};
