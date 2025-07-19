import {
  S3Event,
  S3EventRecord,
  SQSBatchItemFailure,
  SQSEvent,
} from 'aws-lambda';
import { BatchWriteItemCommand, DynamoDB } from '@aws-sdk/client-dynamodb';
import { Image } from '../types/image.type';
import { getImagePk, getImageSk } from '../types/image.dynamodb.dto';
import { partial } from 'effect/SchemaAST';

function getCreatorOf(s3EventRecord: S3EventRecord): string | undefined {
  return s3EventRecord.s3.object.key.split('/')[0];
}

export async function handler(event: SQSEvent) {
  const s3Events: S3Event[] = event.Records.map((record) => {
    return JSON.parse(record.body);
  });
  const dynamoDb = new DynamoDB();
  const partialFailures: SQSBatchItemFailure[] = [];
  for (const s3Event of s3Events) {
    for (const s3EventRecord of s3Event.Records) {
      try {
        await dynamoDb.updateItem({
          TableName: process.env.IMAGE_TABLE_NAME!,
          Key: {
            pk: { S: getImagePk() },
            sk: {
              S: getImageSk(
                getCreatorOf(s3EventRecord),
                'success',
                s3EventRecord.s3.object.key,
              ),
            },
            status: { S: 'success' },
          },
        });
      } catch (error) {
        console.error('Error updating item in DynamoDB:', error);
        partialFailures.push({
          itemIdentifier: s3EventRecord.s3.object.key,
        });
      }
    }
  }
}
