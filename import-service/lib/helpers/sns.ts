import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';

const snsClient = new SNSClient({});

export const publishMessages = async (topicArn: string, message: string) => {
  await snsClient.send(
    new PublishCommand({
      TopicArn: topicArn,
      Message: message,
    })
  );
  console.log('message published');
  
};
