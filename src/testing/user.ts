export { User, TextUserData } from 'shared';
import { User } from 'shared';

export function isUser(user: any): user is User {
  return (
    user.id &&
    (user.id instanceof String || typeof user.id === 'string') &&
    user.colour &&
    (user.colour instanceof String || typeof user.colour === 'string')
  );
}
