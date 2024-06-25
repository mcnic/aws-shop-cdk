import { JsonSchema, JsonSchemaType } from 'aws-cdk-lib/aws-apigateway';

export const productStockDto: JsonSchema = {
  type: JsonSchemaType.OBJECT,
  properties: {
    id: { type: JsonSchemaType.STRING },
    title: { type: JsonSchemaType.STRING },
    description: { type: JsonSchemaType.STRING },
    price: {
      type: JsonSchemaType.NUMBER,
      minimum: 0,
    },
    count: {
      type: JsonSchemaType.NUMBER,
      minimum: 0,
    },
  },
  additionalProperties: false,
  required: ['title', 'price', 'count'],
};
