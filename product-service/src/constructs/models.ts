import { Fn } from 'aws-cdk-lib'
import { JsonSchemaType, Model, type IModel, type IRestApi } from 'aws-cdk-lib/aws-apigateway'
import { Construct } from 'constructs'

export interface ProductsServiceModelsProps {
  api: IRestApi
}

const ModelNames = {
  oneProduct: 'OneProductModel',
  createOneProduct: 'CreateOneProductModel',
  manyProducts: 'ManyProductsModel',
  error: 'ErrorModel'
}

export class ProductsServiceModels extends Construct {
  public readonly getManyProducts: IModel
  public readonly getOneProduct: IModel
  public readonly createOneProduct: IModel
  public readonly error: IModel

  constructor(scope: Construct, id: string, props: ProductsServiceModelsProps) {
    super(scope, id)

    this.getOneProduct = this.createGetOneProductModel(props.api)
    this.getManyProducts = this.createGetManyProductsModel(props.api, this.getOneProduct)
    this.createOneProduct = this.createCreateOneProductModel(props.api)
    this.error = this.createErrorModel(props.api)
  }

  private createGetOneProductModel(api: IRestApi): Model {
    return new Model(this, 'OneProductModel', {
      restApi: api,
      modelName: ModelNames.oneProduct,
      schema: {
        title: ModelNames.oneProduct,
        type: JsonSchemaType.OBJECT,
        properties: {
          id: { type: JsonSchemaType.STRING },
          title: { type: JsonSchemaType.STRING },
          description: { type: JsonSchemaType.STRING },
          price: { type: JsonSchemaType.NUMBER },
          count: { type: JsonSchemaType.INTEGER },
          image: { type: JsonSchemaType.STRING }
        },
        required: ['id', 'title', 'description', 'price', 'count', 'image']
      }
    })
  }

  private createCreateOneProductModel(api: IRestApi): Model {
    return new Model(this, 'CreateOneProductModel', {
      restApi: api,
      modelName: ModelNames.createOneProduct,
      schema: {
        title: ModelNames.createOneProduct,
        type: JsonSchemaType.OBJECT,
        properties: {
          title: {
            type: JsonSchemaType.STRING,
            description: 'product name (min 3 characters)',
            minLength: 3
          },
          description: {
            type: JsonSchemaType.STRING,
            description: 'product description (min 3 characters)',
            minLength: 3
          },
          price: {
            type: JsonSchemaType.NUMBER,
            description: 'product price in USD',
            multipleOf: 0.01,
            minimum: 0,
            exclusiveMinimum: true
          },
          count: {
            type: JsonSchemaType.INTEGER,
            description: 'number of products in stock',
            minimum: 0,
            exclusiveMinimum: false
          },
          image: { type: JsonSchemaType.STRING, description: 'image uri', format: 'uri' }
        },
        required: ['title', 'description', 'price', 'count', 'image']
      }
    })
  }

  private createGetManyProductsModel(api: IRestApi, oneProductModel: IModel): IModel {
    return new Model(this, 'ManyProductsModel', {
      restApi: api,
      modelName: ModelNames.manyProducts,
      schema: {
        title: ModelNames.manyProducts,
        type: JsonSchemaType.ARRAY,
        items: {
          ref: this.getModelRef(api, oneProductModel)
        }
      }
    })
  }

  private createErrorModel(api: IRestApi): IModel {
    return new Model(this, 'ErrorModel', {
      restApi: api,
      modelName: ModelNames.error,
      schema: {
        title: ModelNames.error,
        type: JsonSchemaType.OBJECT,
        properties: {
          message: { type: JsonSchemaType.STRING },
          issues: { type: JsonSchemaType.ARRAY, items: { type: JsonSchemaType.STRING } }
        },
        required: ['message']
      }
    })
  }

  private getModelRef = (api: IRestApi, model: IModel): string =>
    Fn.join('', [
      'https://apigateway.amazonaws.com/restapis/',
      api.restApiId,
      '/models/',
      model.modelId
    ])
}