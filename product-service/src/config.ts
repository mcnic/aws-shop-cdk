import * as dotenv from 'dotenv';
import path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  PRODUCTS_TABLE_NAME: 'Products',
  STOCKS_TABLE_NAME: 'Stocks',
  topicName: 'createProductTopic',
  productTableName: 'Products',
  stockTableName: 'Stocks',
  emailImportSuccess: process.env.CDK_EMAIL_IMPORT_SUCCESS ?? '',
  emailImporLongQueue: process.env.CDK_EMAIL_IMPORT_OVERLENGTH ?? '',
  batchSize: Number(process.env.CDK_BATCH_SIZE) ?? 5,
};
