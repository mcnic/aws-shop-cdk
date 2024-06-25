import { execSync } from 'child_process';

const tableName = 'AwsShopCdkStack-DynamoDBProductsED6EDB88-62I2IWCR5Z8O';

const products = [
  {
    description: 'Short Product Description1',
    id: '7567ec4b-b10c-48c5-9345-fc73c48a80aa',
    price: 24,
    title: 'ProductOne',
  },
  {
    description: 'Short Product Description7',
    id: '7567ec4b-b10c-48c5-9345-fc73c48a80a1',
    price: 15,
    title: 'ProductTitle',
  },
  {
    description: 'Short Product Description2',
    id: '7567ec4b-b10c-48c5-9345-fc73c48a80a3',
    price: 23,
    title: 'Product',
  },
  {
    description: 'Short Product Description4',
    id: '7567ec4b-b10c-48c5-9345-fc73348a80a1',
    price: 15,
    title: 'ProductTest',
  },
  {
    description: 'Short Product Descriptio1',
    id: '7567ec4b-b10c-48c5-9445-fc73c48a80a2',
    price: 23,
    title: 'Product2',
  },
  {
    description: 'Short Product Description7',
    id: '7567ec4b-b10c-45c5-9345-fc73c48a80a1',
    price: 15,
    title: 'ProductName',
  },
];

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
