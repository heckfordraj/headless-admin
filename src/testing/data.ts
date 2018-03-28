import { Page } from './page';
import { Block } from './block';

export const Pages: Page[] = [
  {
    id: 'page-1',
    name: 'Page 1',
    dataId: '1',
    revisions: { currentId: 'a' },
    lastModified: 1
  },
  {
    id: 'page-2',
    name: 'Page 2',
    dataId: '2',
    revisions: { currentId: 'b' },
    lastModified: 2
  },
  {
    id: 'page-3',
    name: 'Page 3',
    dataId: '3',
    revisions: { currentId: 'c' },
    lastModified: 3
  },
  {
    id: 'page-4',
    name: 'Page 4',
    dataId: '4',
    revisions: { currentId: 'd' },
    lastModified: 4
  },
  {
    id: 'page-5',
    name: 'Page 5',
    dataId: '5',
    revisions: { currentId: 'e' },
    lastModified: 5
  }
];

export const Blocks: { [id: string]: [Block.Base] } = {
  '1': [
    { id: '1', type: 'text', order: 1 },
    { id: '2', type: 'image', order: 2 },
    { id: '3', type: 'text', order: 3 }
  ],
  '2': [
    { id: '1', type: 'image', order: 1 },
    { id: '2', type: 'text', order: 2 },
    { id: '3', type: 'image', order: 3 }
  ],
  '3': [
    { id: '1', type: 'text', order: 1 },
    { id: '2', type: 'image', order: 2 },
    { id: '3', type: 'text', order: 3 }
  ],
  '4': [
    { id: '1', type: 'image', order: 1 },
    { id: '2', type: 'text', order: 2 },
    { id: '3', type: 'image', order: 3 }
  ],
  '5': [
    { id: '1', type: 'text', order: 1 },
    { id: '2', type: 'image', order: 2 },
    { id: '3', type: 'text', order: 3 }
  ]
};

export const Data: Block.Data.Base[] = [
  { id: '1', text: 'Hello' },
  { id: '2', url: 'http://' },
  { id: '3', text: 'Hello' },
  { id: '4', url: 'http://' },
  { id: '5', text: 'Hello' }
];
