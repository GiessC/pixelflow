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
  const images: ImageDynamoDBDto[] = [];
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
      images.push(image);
    } catch (error) {
      console.error('Error updating item in DynamoDB:', error);
    }
  }
  // Batch write to DynamoDB
  if (!images.length) {
    console.log('No images to update.');
    return;
  }
  const writeRequests: WriteRequest[] = [];
  for (const image of images) {
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
    writeRequests.push({
      PutRequest: {
        Item: marshall(image, {
          removeUndefinedValues: true,
        }),
      },
    });
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
    console.log(`Successfully updated ${images.length} images.`);
  } catch (error) {
    console.error('Error writing images to DynamoDB:', error);
  }
}
