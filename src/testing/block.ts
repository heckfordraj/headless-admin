export { Block } from '../app/shared/block';
import { Block } from '../app/shared/block';

export function isBlock(block: any): block is Block.Base {
  return (
    block.id &&
    (block.id instanceof String || typeof block.id === 'string') &&
    block.type &&
    (block.type instanceof String || typeof block.type === 'string') &&
    block.order &&
    (block.order instanceof Number || typeof block.order === 'number')
  );
}
