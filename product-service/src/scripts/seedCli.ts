import { execSync } from 'child_process';
import { config } from '../config';
import { products } from '../mocks/products';

const tableName = config.PRODUCTS_TABLE_NAME;

for (let prod of products)
  execSync(`aws dynamodb put-item \
   --table-name "${tableName}" \
    --item '{
       "id": {"S": "${prod.id}"},\
       "title": {"S": "${prod.title}"},\
       "description": {"S": "${prod.description}"},\
       "price": {"N": "${prod.price}"}\
      }' \
    --return-consumed-capacity TOTAL`);
