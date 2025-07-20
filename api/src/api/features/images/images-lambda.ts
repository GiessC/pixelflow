import imagesRouter from './images.router';
import serverless from 'serverless-http';

export const handler = serverless(imagesRouter);
