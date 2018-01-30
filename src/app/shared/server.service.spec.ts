import {
  ComponentFixture,
  TestBed,
  async,
  inject
} from '@angular/core/testing';
import { AngularFireDatabaseStub } from '../../testing/angularfiredatabase';
import { Pages } from '../../testing/data';

import { ServerService } from './server.service';
import { AngularFireDatabase } from 'angularfire2/database';

let serverService: ServerService;
let db: Firebase;

const page1 = JSON.parse(JSON.stringify(Pages[0]));
const page2 = JSON.parse(JSON.stringify(Pages[1]));

fdescribe('ServerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
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
    it(
      'should call firebase list',
      async(() => {
        serverService.getCollection('pages').subscribe();
        expect(db.list.calls.count()).toBe(1);
      })
    );

    it(
      'should call firebase list with collection param',
      async(() => {
        serverService.getCollection('name').subscribe();
        let arg = db.list.calls.mostRecent().args[0];

        expect(arg).toBe('name');
      })
    );

    it(
      'should call firebase list valueChanges',
      async(() => {
        serverService.getCollection('pages').subscribe();
        expect(db.valueChanges.calls.count()).toBe(1);
      })
    );

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
    it(
      'should call firebase object',
      async(() => {
        serverService.getPage('1').subscribe();
        expect(db.object.calls.count()).toBe(1);
      })
    );

    it(
      'should call firebase object with page id param',
      async(() => {
        serverService.getPage('1').subscribe();
        let arg = db.object.calls.mostRecent().args[0];

        expect(arg).toBe('pages/1');
      })
    );

    it(
      'should call firebase object valueChanges',
      async(() => {
        serverService.getPage('1').subscribe();
        expect(db.valueChanges.calls.count()).toBe(1);
      })
    );

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
});

function createService() {
  serverService = TestBed.get(ServerService);
  db = new Firebase();
}

class Firebase {
  createPushId: jasmine.Spy;
  list: jasmine.Spy;
  valueChanges: jasmine.Spy;
  object: jasmine.Spy;
  ref: jasmine.Spy;
  update: jasmine.Spy;

  constructor() {
    const angularFireDatabase = TestBed.get(AngularFireDatabase);

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
  }
}
