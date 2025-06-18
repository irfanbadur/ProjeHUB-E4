import { v4 as uuidv4 } from 'uuid';

export function generateUniqueId(prefix = 'obj' ) {
  return `${prefix}_${uuidv4()}`;
}
