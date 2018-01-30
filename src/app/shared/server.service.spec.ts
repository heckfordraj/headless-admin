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

    xit('should throw if not passed page name');
  });

  describe('addPage', () => {
    it(
      'should call firebase object',
      async(() => {
        serverService.addPage({ id: '2' } as any);
        expect(db.object.calls.count()).toBe(1);
      })
    );

    it(
      'should call firebase object with page id param',
      async(() => {
        serverService.addPage({ id: '2' } as any);
        let arg = db.object.calls.mostRecent().args[0];

        expect(arg).toBe('pages/2');
      })
    );

    xit('should throw if not passed page id');
  });

  describe('updatePage', () => {
    let page1 = JSON.parse(JSON.stringify(Pages[0]));
    let page2 = JSON.parse(JSON.stringify(Pages[1]));

    it(
      'should call firebase ref',
      async(() => {
        serverService
          .updatePage(page1, page2)
          .then(() => expect(db.ref.calls.count()).toBe(1));
      })
    );

    it(
      'should call firebase update',
      async(() => {
        serverService
          .updatePage(page1, page2)
          .then(() => expect(db.refUpdate.calls.count()).toBe(1));
      })
    );

    xit("should reject if currentPage and newPage id's are identical", () => {});

    describe('update object', () => {
      it(
        'should set unmodified newPage',
        async(() => {
          serverService.updatePage(page1, page2).then(() => {
            let updateObject = db.refUpdate.calls.mostRecent().args[0];

            expect(updateObject['page-2']).toEqual(page2);
          });
        })
      );

      it(
        'should delete currentPage',
        async(() => {
          serverService.updatePage(page1, page2).then(() => {
            let updateObject = db.refUpdate.calls.mostRecent().args[0];

            expect(updateObject['page-1']).toBeNull();
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
  object: jasmine.Spy;
  ref: jasmine.Spy;
  refUpdate: jasmine.Spy;

  constructor() {
    const angularFireDatabase = TestBed.get(AngularFireDatabase);

    this.createPushId = spyOn(
      angularFireDatabase,
      'createPushId'
    ).and.callThrough();
    this.list = spyOn(angularFireDatabase, 'list').and.callThrough();
    this.object = spyOn(angularFireDatabase, 'object').and.callThrough();
    this.ref = spyOn(angularFireDatabase.database, 'ref').and.callThrough();
    this.refUpdate = spyOn(
      angularFireDatabase.database,
      'refUpdate'
    ).and.callThrough();
  }
}
