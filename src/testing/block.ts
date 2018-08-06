export { Block } from 'shared';
import { Block } from 'shared';

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

export function isImageData(data: any): data is Block.Data.ImageData {
  return (
    data.id &&
    (data.id instanceof String || typeof data.id === 'string') &&
    data.alt &&
    (data.alt instanceof String || typeof data.alt === 'string') &&
    data.url &&
    (data.url instanceof String || typeof data.url === 'string')
  );
}
