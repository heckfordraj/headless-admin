export { User, TextUserData } from '../app/shared/user';
import { User } from '../app/shared/user';

export function isUser(user: any): user is User {
  return (
    user.id &&
    (user.id instanceof String || typeof user.id === 'string') &&
    user.colour &&
    (user.colour instanceof String || typeof user.colour === 'string')
  );
}
