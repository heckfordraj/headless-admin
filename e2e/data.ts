import { Page, Block } from '../src/app/shared';

export const Data = {
  pages: {
    'page-1': {
      id: 'page-1',
      name: 'Page 1',
      dataId: '1',
      revisions: {
        currentId: 'a'
      },
      status: {
        draft: true
      },
      lastModified: 1
    },
    'page-2': {
      id: 'page-2',
      name: 'Page 2',
      dataId: '2',
      revisions: {
        currentId: 'b'
      },
      status: {
        published: true
      },
      lastModified: 1
    },
    'page-3': {
      id: 'page-3',
      name: 'Page 3',
      dataId: '3',
      revisions: {
        currentId: 'c'
      },
      status: {
        draft: true
      },
      lastModified: 1
    },
    'page-4': {
      id: 'page-4',
      name: 'Page 4',
      dataId: '4',
      revisions: {
        currentId: 'd'
      },
      status: {
        archived: true
      },
      lastModified: 1
    },
    'page-5': {
      id: 'page-5',
      name: 'Page 5',
      dataId: '5',
      revisions: {
        currentId: 'e'
      },
      status: {
        archived: true
      },
      lastModified: 1
    }
  } as { [pageId: string]: Page },
  data: {
    '1': {
      a: {
        '1': {
          id: '1',
          type: 'text',
          data: null,
          order: 1
        },
        '2': {
          id: '2',
          type: 'image',
          data: null,
          order: 2
        },
        '3': {
          id: '3',
          type: 'text',
          data: null,
          order: 3
        }
      }
    },
    '2': {
      b: {
        '1': {
          id: '1',
          type: 'image',
          data: null,
          order: 1
        },
        '2': {
          id: '2',
          type: 'text',
          data: null,
          order: 2
        },
        '3': {
          id: '3',
          type: 'image',
          data: null,
          order: 3
        }
      }
    },
    '3': {
      c: {
        '1': {
          id: '1',
          type: 'text',
          data: null,
          order: 1
        },
        '2': {
          id: '2',
          type: 'image',
          data: null,
          order: 2
        },
        '3': {
          id: '3',
          type: 'text',
          data: null,
          order: 3
        }
      }
    },
    '4': {
      d: {
        '1': {
          id: '1',
          type: 'image',
          data: null,
          order: 1
        },
        '2': {
          id: '2',
          type: 'text',
          data: null,
          order: 2
        },
        '3': {
          id: '3',
          type: 'image',
          data: null,
          order: 3
        }
      }
    },
    '5': {
      e: {
        '1': {
          id: '1',
          type: 'text',
          data: null,
          order: 1
        },
        '2': {
          id: '2',
          type: 'image',
          data: null,
          order: 2
        },
        '3': {
          id: '3',
          type: 'text',
          data: null,
          order: 3
        }
      }
    }
  } as {
    [dataId: string]: {
      [revisionId: string]: { [blockId: string]: Block.Base };
    };
  }
};
