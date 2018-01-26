import { Block } from '../app/shared/block';

export function isBlock(block: any): block is Block.Base {
  return (
    block.id &&
    (block.id instanceof String || typeof block.id === 'string') &&
    block.type &&
    (block.type instanceof String || typeof block.type === 'string') &&
    block.data &&
    Array.isArray(block.data)
  );
}
