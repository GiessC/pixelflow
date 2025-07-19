import { S3Event, S3EventRecord } from 'aws-lambda';
import { DynamoDB, WriteRequest } from '@aws-sdk/client-dynamodb';
import {
  getImagePk,
  getImageSk,
  ImageDynamoDBDto,
} from '../../api/features/images/types/image.dynamodb.dto';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

function getCreatorOf(s3EventRecord: S3EventRecord): string | undefined {
  return s3EventRecord.s3.object.key.split('/')[0];
}

export async function handler(event: S3Event): Promise<void> {
  console.log('Processing S3 event:', JSON.stringify(event, null, 2));
  const dynamoDb = new DynamoDB();
  const writeRequests: WriteRequest[] = [];
  for (const s3EventRecord of event.Records) {
    try {
      const itemResponse = await dynamoDb.getItem({
        TableName: process.env.IMAGE_TABLE_NAME,
        Key: {
          pk: { S: getImagePk() },
          sk: {
            S: getImageSk(
              getCreatorOf(s3EventRecord),
              'waiting',
              s3EventRecord.s3.object.key,
            ),
          },
        },
      });
      if (!itemResponse.Item) {
        console.log(`No image found for key: ${s3EventRecord.s3.object.key}`);
        continue;
      }
      const image: ImageDynamoDBDto = unmarshall(
        itemResponse.Item,
      ) as ImageDynamoDBDto;
      console.log('Image found:', image);
      writeRequests.push({
        DeleteRequest: {
          Key: {
            pk: { S: image.pk },
            sk: { S: image.sk },
          },
        },
      });
      image.status = 'success';
      image.sk = getImageSk(image.createdBy, image.status, image.fileName);
      image.url = `https://${s3EventRecord.s3.bucket.name}.s3.amazonaws.com/${s3EventRecord.s3.object.key}`;
      writeRequests.push({
        PutRequest: {
          Item: marshall(image, {
            removeUndefinedValues: true,
          }),
        },
      });
    } catch (error) {
      console.error('Error updating item in DynamoDB:', error);
    }
  }
  try {
    const { UnprocessedItems } = await dynamoDb.batchWriteItem({
      RequestItems: {
        [process.env.IMAGE_TABLE_NAME!]: writeRequests,
      },
    });
    if (UnprocessedItems && Object.keys(UnprocessedItems).length > 0) {
      console.error('Some images were not processed:', UnprocessedItems);
      return;
    }
    console.log(`Successfully updated ${writeRequests.length} images.`);
  } catch (error) {
    console.error('Error writing images to DynamoDB:', error);
  }
}
