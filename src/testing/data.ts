import { Iterable } from 'immutable';
import * as Quill from 'quill';
const Delta: Quill.DeltaStatic = Quill.import('delta');

import { Page } from './page';
import { Block } from './block';
import { User } from './user';

export const Data = {
  getPages<T extends void | string>(
    id?: T
  ): T extends string ? (Page) : Page[] {
    const pages: Page[] = [
      {
        id: 'page-1',
        name: 'Page 1',
        dataId: '1',
        revisions: { currentId: 'a' },
        status: {
          draft: true
        },
        lastModified: 1
      },
      {
        id: 'page-2',
        name: 'Page 2',
        dataId: '2',
        revisions: { currentId: 'b' },
        status: {
          published: true
        },
        lastModified: 2
      },
      {
        id: 'page-3',
        name: 'Page 3',
        dataId: '3',
        revisions: { currentId: 'c' },
        status: {
          draft: true
        },
        lastModified: 3
      },
      {
        id: 'page-4',
        name: 'Page 4',
        dataId: '4',
        revisions: { currentId: 'd' },
        status: {
          archived: true
        },
        lastModified: 4
      },
      {
        id: 'page-5',
        name: 'Page 5',
        dataId: '5',
        revisions: { currentId: 'e' },
        status: {
          archived: true
        },
        lastModified: 5
      }
    ];

    if (!id) return makeImmutable(pages) as any;

    const page = pages.find(page => page.id === id);
    return makeImmutable(page) as any;
  },

  getBlocks<T extends void | 'text' | 'image'>(
    type?: T
  ): T extends string ? (Block.Base) : Block.Base[] {
    const blocks: Block.Base[] = [
      { id: '1', type: 'text', order: 1 },
      { id: '2', type: 'image', order: 2 },
      { id: '3', type: 'text', order: 3 }
    ];

    if (!type) return makeImmutable(blocks) as any;

    const block = blocks.find(block => block.type === type);
    return makeImmutable(block) as any;
  },

  getBlockDatas<T extends void | number>(
    index?: T
  ): T extends number
    ? (Block.Data.TextData | Block.Data.ImageData)
    : Block.Data.Base[] {
    const data = [
      { id: 1, user: 'me', delta: null } as Block.Data.TextData,
      { id: '2', url: 'http://', alt: null } as Block.Data.ImageData,
      { id: 3, user: 'me', delta: null } as Block.Data.TextData,
      { id: '4', url: 'http://', alt: null } as Block.Data.ImageData,
      { id: 5, user: 'me', delta: null } as Block.Data.TextData
    ];

    return index
      ? makeImmutable(data[index as number])
      : (makeImmutable(data) as any);
  },

  getImageBlock(): Block.Base {
    const data: Block.Base = {
      type: 'image',
      id: '1',
      order: 1
    };

    return makeImmutable(data);
  },

  getImageBlockData(): Block.Data.ImageData {
    const data: Block.Data.ImageData = {
      id: '1',
      alt: 'Image',
      url: 'http://via.placeholder.com/350x150'
    };

    return makeImmutable(data);
  },

  getUsers<T extends void | number>(
    index?: T
  ): T extends number ? User[] : User[] {
    const data: User[] = [
      {
        id: 'abc',
        colour: '#000',
        current: {
          pageId: 'page-1',
          blockId: '1',
          data: { index: 0, length: 1 }
        }
      },
      {
        id: '2',
        colour: '#fff',
        current: {
          pageId: 'page-1',
          blockId: '2',
          data: { index: 1, length: 2 }
        }
      },
      {
        id: '3',
        colour: '#eee',
        current: {
          pageId: 'page-1',
          blockId: '1',
          data: { index: 2, length: 3 }
        }
      },
      {
        id: '4',
        colour: '#ccc',
        current: {
          pageId: 'page-2',
          blockId: '2',
          data: { index: 3, length: 4 }
        }
      },
      {
        id: '5',
        colour: '#bbb',
        current: {
          pageId: 'page-2',
          blockId: '1',
          data: { index: 4, length: 5 }
        }
      }
    ];

    return index
      ? makeImmutable(data[index as number])
      : (makeImmutable(data) as any);
  },

  getTextBlockDataDeltas<T extends void | number>(
    index?: T
  ): T extends number ? Quill.DeltaStatic : Quill.DeltaStatic[] {
    const data: Quill.DeltaStatic[] = [
      new Delta([{ insert: 'Hello' }, { insert: ' World.' }]),
      new Delta([{ insert: 'Lorem ' }, { insert: 'ipsum' }])
    ];

    return index
      ? makeImmutable(data[index as number])
      : (makeImmutable(data) as any);
  },

  getTextBlockData(): Block.Data.TextData {
    const data: Block.Data.TextData = {
      id: 1,
      user: 'person',
      delta: new Delta([{ insert: 'Hello' }, { insert: ' World.' }])
    };

    return makeImmutable(data);
  },

  TextBlockData: {
    id: 1,
    user: 'person',
    delta: new Delta([{ insert: 'Hello' }, { insert: ' World.' }])
  } as Block.Data.TextData
};

export const makeImmutable = <T>(data: T): T => Iterable(data).toJS();
