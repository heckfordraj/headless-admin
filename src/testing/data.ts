import { Page } from './page';
import { Block } from './block';

export const Pages: Page[] = [
  { id: 'page-1', name: 'Page 1', dataId: '1', revisions: { currentId: 'a' } },
  { id: 'page-2', name: 'Page 2', dataId: '2', revisions: { currentId: 'b' } },
  { id: 'page-3', name: 'Page 3', dataId: '3', revisions: { currentId: 'c' } },
  { id: 'page-4', name: 'Page 4', dataId: '4', revisions: { currentId: 'd' } },
  { id: 'page-5', name: 'Page 5', dataId: '5', revisions: { currentId: 'e' } }
];

export const Blocks: { [id: string]: [Block.Base] } = {
  '1': [{ id: '1', type: 'text', data: null, order: 1 }],
  '2': [{ id: '2', type: 'image', data: null, order: 2 }],
  '3': [{ id: '3', type: 'text', data: null, order: 3 }],
  '4': [{ id: '4', type: 'image', data: null, order: 4 }],
  '5': [{ id: '5', type: 'text', data: null, order: 5 }]
};

export const Data: Block.Data.Base[] = [
  { id: '1', text: 'Hello' },
  { id: '2', url: 'http://' },
  { id: '3', text: 'Hello' },
  { id: '4', url: 'http://' },
  { id: '5', text: 'Hello' }
];
