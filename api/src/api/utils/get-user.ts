import { asyncLocalStorage } from '../../middlewares';

export function getUser(): { userId: string; idToken: string } | undefined {
  return asyncLocalStorage.getStore();
}
