# backend for [nodejs-aws-shop-react project](https://github.com/mcnic/nodejs-aws-shop-react)

## Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template

## AWS

1. `npm install -g aws-cdk`
1. once run bootstrapping `cdk bootstrap`
1. use `cdk synth && cdk deploy` for deploy
1. use `cdk destroy` for destroy

## DynamoDB

- create table
  `aws dynamodb create-table \ --table-name MusicCollection \ --attribute-definitions AttributeName=Artist,AttributeType=S AttributeName=SongTitle,AttributeType=S \ --key-schema AttributeName=Artist,KeyType=HASH AttributeName=SongTitle,KeyType=RANGE \ --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1`
- add item
  `aws dynamodb put-item \ --table-name MusicCollection \ --item '{ "Artist": {"S": "Acme Band"},\ "SongTitle": {"S": "Happy Day"},\ "AlbumTitle": {"S": "Songs About Life"}\ }' \ --return-consumed-capacity TOTAL`
  or
  `aws dynamodb query --table-name MusicCollection \ --key-condition-expression "Artist = :v1 AND SongTitle = :v2" \ --expression-attribute-values file://expression-attributes.json`

- seed data `npm run seed`
