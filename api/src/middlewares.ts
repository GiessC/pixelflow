import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { NextFunction, Request, Response } from 'express';
import { AsyncLocalStorage } from 'node:async_hooks';

export const asyncLocalStorage = new AsyncLocalStorage<
  | {
      userId: string;
      idToken: string;
    }
  | undefined
>();

export async function authentication(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const idToken = req.headers.authorization?.split(' ')[1];
  if (!idToken) {
    return res
      .status(401)
      .json({ message: 'No ID token was provided in the request headers.' });
  }

  const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USER_POOL_ID!,
    tokenUse: 'id',
    clientId: process.env.COGNITO_APP_CLIENT_ID!,
  });

  try {
    const token = await verifier.verify(idToken);
    const userId = token.sub;
    asyncLocalStorage.run({ userId, idToken }, () => {
      next();
    });
  } catch (error) {
    console.error('JWT verification failed:', error);
    return res
      .status(401)
      .json({ message: 'Unauthorized. Please provide a valid token.' });
  }
}
