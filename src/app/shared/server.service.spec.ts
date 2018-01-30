import {
  ComponentFixture,
  TestBed,
  async,
  inject
} from '@angular/core/testing';
import { AngularFireDatabaseStub } from '../../testing/angularfiredatabase';

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

    it(
      'should throw if not passed name',
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
});

function createService() {
  serverService = TestBed.get(ServerService);
  db = new Firebase();
}

class Firebase {
  createPushId: jasmine.Spy;
  list: jasmine.Spy;

  constructor() {
    const angularFireDatabase = TestBed.get(AngularFireDatabase);

    this.createPushId = spyOn(
      angularFireDatabase,
      'createPushId'
    ).and.callThrough();
    this.list = spyOn(angularFireDatabase, 'list').and.callThrough();
  }
}
