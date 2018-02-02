import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { AngularFireDatabaseStub } from '../../testing/angularfiredatabase';
import { Pages, Blocks, Data } from '../../testing/data';

import { LoggerService } from './logger.service';
import { ServerService } from './server.service';
import { AngularFireDatabase } from 'angularfire2/database';

let serverService: ServerService;
let angularFireDatabase: AngularFireDatabaseStub;
let db: Firebase;

const page1 = JSON.parse(JSON.stringify(Pages[0]));
const page2 = JSON.parse(JSON.stringify(Pages[1]));
const block1 = JSON.parse(JSON.stringify(Blocks['1'][0]));
const block2 = JSON.parse(JSON.stringify(Blocks['2'][2]));
const data1 = JSON.parse(JSON.stringify(Data[0]));
const data2 = JSON.parse(JSON.stringify(Data[1]));

describe('ServerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoggerService,
        ServerService,
        { provide: AngularFireDatabase, useClass: AngularFireDatabaseStub }
      ]
    });
  });

  beforeEach(async(() => createService()));

  describe('createId', () => {
    it('should call firebase createPushId', () => {
      serverService.createId();
      expect(db.createPushId.calls.count()).toBe(1);
    });
  });

  describe('getCollection', () => {
    it('should call firebase list', () => {
      serverService.getCollection('pages').subscribe();
      expect(db.list.calls.count()).toBe(1);
    });

    it('should call firebase list with collection param', () => {
      serverService.getCollection('name').subscribe();
      let arg = db.list.calls.mostRecent().args[0];

      expect(arg).toBe('name');
    });

    it('should call firebase list valueChanges', () => {
      serverService.getCollection('pages').subscribe();
      expect(db.valueChanges.calls.count()).toBe(1);
    });

    xit(
      'should throw if not passed collection name',
      async(() => {
        serverService
          .getCollection(null)
          .subscribe(
            res => expect(res).toBeUndefined(),
            err => expect(err).toBeDefined()
          );
      })
    );
  });

  describe('getPage', () => {
    it('should call firebase object', () => {
      serverService.getPage('1').subscribe();
      expect(db.object.calls.count()).toBe(1);
    });

    it('should call firebase object with page id param', () => {
      serverService.getPage('1').subscribe();
      let arg = db.object.calls.mostRecent().args[0];

      expect(arg).toBe('pages/1');
    });

    it('should call firebase object valueChanges', () => {
      serverService.getPage('1').subscribe();
      expect(db.valueChanges.calls.count()).toBe(1);
    });

    xit('should throw if not passed page name');
  });

  describe('addPage', () => {
    it(
      'should call firebase object',
      async(() => {
        serverService
          .addPage(page1)
          .then(_ => expect(db.object.calls.count()).toBe(1));
      })
    );

    it(
      'should call firebase object with page id param',
      async(() => {
        serverService.addPage(page1).then(_ => {
          let arg = db.object.calls.mostRecent().args[0];

          expect(arg).toBe('pages/page-1');
        });
      })
    );

    xit('should throw if not passed page id');
  });

  describe('updatePage', () => {
    it(
      'should call firebase ref',
      async(() => {
        serverService
          .updatePage(page1, page2)
          .then(_ => expect(db.ref.calls.count()).toBe(1));
      })
    );

    it(
      'should call firebase update',
      async(() => {
        serverService
          .updatePage(page1, page2)
          .then(_ => expect(db.update.calls.count()).toBe(1));
      })
    );

    xit("should reject if currentPage and newPage id's are identical", () => {});

    describe('update object', () => {
      it(
        'should set unmodified newPage',
        async(() => {
          serverService.updatePage(page1, page2).then(_ => {
            let updateObject = db.update.calls.mostRecent().args[0];

            expect(updateObject['page-2']).toEqual(page2);
          });
        })
      );

      it(
        'should delete currentPage',
        async(() => {
          serverService.updatePage(page1, page2).then(_ => {
            let updateObject = db.update.calls.mostRecent().args[0];

            expect(updateObject['page-1']).toBeNull();
          });
        })
      );
    });
  });

  describe('removePage', () => {
    it(
      'should call firebase ref',
      async(() => {
        serverService
          .removePage(page1)
          .then(_ => expect(db.ref.calls.count()).toBe(1));
      })
    );

    it(
      'should call firebase update',
      async(() => {
        serverService
          .removePage(page1)
          .then(_ => expect(db.update.calls.count()).toBe(1));
      })
    );

    describe('update object', () => {
      it(
        'should delete page',
        async(() => {
          serverService.removePage(page2).then(_ => {
            let updateObject = db.update.calls.mostRecent().args[0];

            expect(updateObject['pages/page-2']).toBeNull();
          });
        })
      );

      it(
        'should delete page data',
        async(() => {
          serverService.removePage(page2).then(_ => {
            let updateObject = db.update.calls.mostRecent().args[0];

            expect(updateObject['data/2']).toBeNull();
          });
        })
      );
    });
  });

  describe('publishPage', () => {
    it('should call createId', () => {
      serverService.publishPage(page1);

      expect(db.createId.calls.count()).toBe(1);
    });

    it('should call firebase createPushId', () => {
      serverService.publishPage(page1);

      expect(db.createPushId.calls.count()).toBe(1);
    });

    it('should call firebase ref (1)', () => {
      serverService.publishPage(page1);

      expect(db.ref.calls.count()).toBe(1);
    });

    it('should call firebase ref (1) with page param', () => {
      serverService.publishPage(page1);
      let arg = db.ref.calls.mostRecent().args[0];

      expect(arg).toBe('data/1/a');
    });

    it('should call firebase ref once', () => {
      db.once = spyOn(angularFireDatabase.database, 'once').and.callThrough();

      serverService.publishPage(page1);

      expect(db.once.calls.count()).toBe(1);
    });

    it(
      'should call firebase ref (2)',
      async(() => {
        db.once = spyOn(angularFireDatabase.database, 'once').and.returnValue(
          Promise.resolve(null)
        );

        serverService
          .publishPage(page1)
          .then(_ => expect(db.ref.calls.count()).toBe(2))
          .catch(_ => undefined);
      })
    );

    it(
      'should call firebase ref (2) with page param',
      async(() => {
        db.once = spyOn(angularFireDatabase.database, 'once').and.returnValue(
          Promise.resolve(null)
        );

        serverService
          .publishPage(page1)
          .then(_ => {
            let arg = db.ref.calls.mostRecent().args[0];

            expect(arg).toBe('data/1/abcdefg');
          })
          .catch(_ => undefined);
      })
    );

    it(
      'should call firebase ref set',
      async(() => {
        db.once = spyOn(angularFireDatabase.database, 'once').and.callThrough();

        serverService
          .publishPage(page1)
          .then(_ => expect(db.set.calls.count()).toBe(1));
      })
    );

    it(
      'should call firebase ref (3)',
      async(() => {
        db.once = spyOn(angularFireDatabase.database, 'once').and.callThrough();

        serverService
          .publishPage(page1)
          .then(_ => expect(db.ref.calls.count()).toBe(3));
      })
    );

    it(
      'should call firebase ref (3) with page param',
      async(() => {
        db.once = spyOn(angularFireDatabase.database, 'once').and.callThrough();

        serverService.publishPage(page1).then(_ => {
          let arg = db.ref.calls.mostRecent().args[0];

          expect(arg).toBe('pages/page-1/revisions/');
        });
      })
    );

    it(
      'should call firebase ref update',
      async(() => {
        db.once = spyOn(angularFireDatabase.database, 'once').and.callThrough();

        serverService
          .publishPage(page1)
          .then(_ => expect(db.update.calls.count()).toBe(1));
      })
    );

    it(
      'should call firebase ref update with update object',
      async(() => {
        db.once = spyOn(angularFireDatabase.database, 'once').and.callThrough();

        serverService.publishPage(page1).then(_ => {
          let arg = db.update.calls.mostRecent().args[0];

          expect(arg.publishedId).toBe('a');
          expect(arg.currentId).toBe('abcdefg');
        });
      })
    );

    xit('should reject if not passed page dataId', async(() => {}));

    xit(
      'should reject if not passed page revisions currentId',
      async(() => {})
    );

    xit('should reject if not passed page id', async(() => {}));
  });

  describe('getBlocks', () => {
    it('should call firebase list', () => {
      serverService.getBlocks(page2);

      expect(db.list.calls.count()).toBe(1);
    });

    it('should call firebase list with page param', () => {
      serverService.getBlocks(page2);
      let arg = db.list.calls.mostRecent().args[0];

      expect(arg).toBe('data/2/b');
    });

    it('should call firebase valueChanges', () => {
      serverService.getBlocks(page2);

      expect(db.valueChanges.calls.count()).toBe(1);
    });
  });

  describe('addBlock', () => {
    it('should call firebase list', () => {
      serverService.addBlock(page1, block1);

      expect(db.list.calls.count()).toBe(1);
    });

    it('should call firebase list with page param', () => {
      serverService.addBlock(page1, block1);
      let arg = db.list.calls.mostRecent().args[0];

      expect(arg).toBe('data/1/a');
    });

    it('should call firebase set', () => {
      serverService.addBlock(page1, block1);

      expect(db.set.calls.count()).toBe(1);
    });

    it('should call firebase set with block params', () => {
      serverService.addBlock(page1, block1);
      let args = db.set.calls.mostRecent().args;

      expect(args[0]).toBe('1');
      expect(args[1]).toBe(block1);
    });
  });

  describe('updateBlock', () => {
    it('should call firebase list', () => {
      serverService.updateBlock(page2, block2, data2);

      expect(db.list.calls.count()).toBe(1);
    });

    it('should call firebase list with page and block param', () => {
      serverService.updateBlock(page2, block2, data2);
      let arg = db.list.calls.mostRecent().args[0];

      expect(arg).toBe('data/2/b/3/data');
    });

    it('should call firebase list set', () => {
      serverService.updateBlock(page2, block2, data2);

      expect(db.set.calls.count()).toBe(1);
    });

    it('should call firebase list set with data params', () => {
      serverService.updateBlock(page2, block2, data2);
      let args = db.set.calls.mostRecent().args;

      expect(args[0]).toBe('2');
      expect(args[1]).toBe(data2);
    });
  });

  describe('removeBlock', () => {
    it('should call firebase list', () => {
      serverService.removeBlock(page2, block1);

      expect(db.list.calls.count()).toBe(1);
    });

    it('should call firebase list with page param', () => {
      serverService.removeBlock(page2, block1);
      let arg = db.list.calls.mostRecent().args[0];

      expect(arg).toBe('data/2/b');
    });

    it('should call firebase list remove', () => {
      serverService.removeBlock(page2, block1);

      expect(db.remove.calls.count()).toBe(1);
    });

    it('should call firebase list remove with block id', () => {
      serverService.removeBlock(page2, block1);
      let arg = db.remove.calls.mostRecent().args[0];

      expect(arg).toBe('1');
    });
  });

  describe('orderBlock', () => {
    it('should call firebase database ref', () => {
      serverService.orderBlock(page1, block1, block2);

      expect(db.ref.calls.count()).toBe(1);
    });

    it('should call firebase database ref with page param', () => {
      serverService.orderBlock(page1, block1, block2);
      let arg = db.ref.calls.mostRecent().args[0];

      expect(arg).toBe('data/1/a');
    });

    it('should call firebase database ref update', () => {
      serverService.orderBlock(page1, block1, block2);

      expect(db.update.calls.count()).toBe(1);
    });

    describe('update object', () => {
      it('should set block order', () => {
        serverService.orderBlock(page1, block1, block2);
        let arg = db.update.calls.mostRecent().args[0];

        expect(arg['1/order']).toBe(1);
      });

      it('should set block replaced order', () => {
        serverService.orderBlock(page1, block1, block2);
        let arg = db.update.calls.mostRecent().args[0];

        expect(arg['3/order']).toBe(3);
      });
    });
  });
});

function createService() {
  serverService = TestBed.get(ServerService);
  angularFireDatabase = TestBed.get(AngularFireDatabase);
  db = new Firebase();
}

class Firebase {
  createId: jasmine.Spy;
  createPushId: jasmine.Spy;
  list: jasmine.Spy;
  valueChanges: jasmine.Spy;
  object: jasmine.Spy;
  ref: jasmine.Spy;
  update: jasmine.Spy;
  once: jasmine.Spy;
  set: jasmine.Spy;
  remove: jasmine.Spy;

  constructor() {
    this.createId = spyOn(serverService, 'createId').and.callThrough();
    this.createPushId = spyOn(
      angularFireDatabase,
      'createPushId'
    ).and.callThrough();
    this.list = spyOn(angularFireDatabase, 'list').and.callThrough();
    this.valueChanges = spyOn(
      angularFireDatabase,
      'valueChanges'
    ).and.callThrough();
    this.object = spyOn(angularFireDatabase, 'object').and.callThrough();
    this.ref = spyOn(angularFireDatabase.database, 'ref').and.callThrough();
    this.update = spyOn(
      angularFireDatabase.database,
      'update'
    ).and.callThrough();
    this.set = spyOn(angularFireDatabase, 'set').and.callThrough();
    this.remove = spyOn(angularFireDatabase, 'remove').and.callThrough();
  }
}
