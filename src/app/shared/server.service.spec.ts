import { TestBed, async } from '@angular/core/testing';
import {
  FirebaseApp,
  MockFirebaseApp,
  AngularFireDatabase,
  MockAngularFireDatabase,
  HumanizePipe,
  MockHumanizePipe,
  LoggerService,
  MockLoggerService,
  Page,
  Block,
  User,
  isUser,
  Data,
  makeImmutable
} from 'testing';

import { of, from } from 'rxjs';

import { ServerService } from './server.service';

let serverService: ServerService;
let firebaseApp: MockFirebaseApp;
let angularFireDatabase: MockAngularFireDatabase;
let humanizePipe: jasmine.Spy;
let service: ServerServiceStub;

describe('ServerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: LoggerService, useClass: MockLoggerService },
        { provide: FirebaseApp, useClass: MockFirebaseApp },
        { provide: AngularFireDatabase, useClass: MockAngularFireDatabase },
        { provide: HumanizePipe, useClass: MockHumanizePipe },
        ServerService
      ]
    });
  });

  beforeEach(async(() => createService()));

  it('should create service', () => {
    expect(serverService).toBeTruthy();
  });

  it('should call createId', () => {
    expect(service.createId).toHaveBeenCalled();
  });

  it('should call AngularFireDatabase list', () => {
    expect(angularFireDatabase.list).toHaveBeenCalled();
  });

  it(`should call AngularFireDatabase list with 'users' arg`, () => {
    expect(angularFireDatabase.list).toHaveBeenCalledWith('users');
  });

  it('should call AngularFireDatabase list valueChanges', () => {
    expect(angularFireDatabase.listSpy.valueChanges).toHaveBeenCalled();
  });

  describe('getUser', () => {
    it('should return user', () => {
      const user: any = serverService.getUser();

      expect(user).toEqual({
        id: 'abcdefg',
        colour: jasmine.any(String)
      });
    });

    it('should return user as User', () => {
      const user = serverService.getUser();

      expect(isUser(user)).toBe(true);
    });
  });

  describe('updateBlockContent', () => {
    beforeEach(() =>
      serverService.updateBlockContent(
        Data.getBlocks('text'),
        Data.getTextBlockData()
      ));

    it('should call AngularFireDatabase object', () => {
      expect(angularFireDatabase.object).toHaveBeenCalled();
    });

    it('should call AngularFireDatabase object with content path arg', () => {
      expect(angularFireDatabase.object).toHaveBeenCalledWith('content/1/1');
    });

    it('should call AngularFireDatabase object set', () => {
      expect(angularFireDatabase.objectSpy.set).toHaveBeenCalled();
    });

    it('should call AngularFireDatabase object set with data arg', () => {
      expect(angularFireDatabase.objectSpy.set).toHaveBeenCalledWith(
        Data.getTextBlockData()
      );
    });
  });

  describe('updateTextBlockContent', () => {
    beforeEach(() =>
      serverService.updateTextBlockContent(
        Data.getBlocks('text'),
        Data.getTextBlockData()
      ));

    it('should call FirebaseApp database', () => {
      expect(firebaseApp.database).toHaveBeenCalled();
    });

    it('should call FirebaseApp database ref', () => {
      expect(firebaseApp.databaseSpy.ref).toHaveBeenCalled();
    });

    it('should call FirebaseApp database ref with content path arg', () => {
      expect(firebaseApp.databaseSpy.ref).toHaveBeenCalledWith('content/1/1');
    });

    it('should call FirebaseApp database ref transaction', () => {
      expect(firebaseApp.databaseRefSpy.transaction).toHaveBeenCalled();
    });

    it('should call FirebaseApp database ref transaction with transaction args', () => {
      expect(firebaseApp.databaseRefSpy.transaction).toHaveBeenCalledWith(
        jasmine.any(Function),
        null,
        false
      );
    });
  });

  describe('getBlockContent', () => {
    beforeEach(() => serverService.getBlockContent(Data.getBlocks('text')));

    it('should call AngularFireDatabase list', () => {
      expect(angularFireDatabase.list).toHaveBeenCalled();
    });

    it('should call AngularFireDatabase list with content path arg', () => {
      expect(angularFireDatabase.list).toHaveBeenCalledWith('content/1');
    });

    it('should call AngularFireDatabase list stateChanges', () => {
      expect(angularFireDatabase.listSpy.stateChanges).toHaveBeenCalled();
    });

    it(`should call AngularFireDatabase list stateChanges with 'child_added' arg`, () => {
      expect(angularFireDatabase.listSpy.stateChanges).toHaveBeenCalledWith([
        'child_added'
      ]);
    });
  });

  describe('createId', () => {
    it('should call AngularFireDatabase createPushId', () => {
      serverService.createId();

      expect(angularFireDatabase.createPushId).toHaveBeenCalled();
    });
  });

  describe('getCollection', () => {
    it('should call AngularFireDatabase list', () => {
      serverService.getCollection('posts', null);

      expect(angularFireDatabase.list).toHaveBeenCalled();
    });

    it('should call AngularFireDatabase list with name arg', () => {
      serverService.getCollection('posts', null);

      expect(angularFireDatabase.list).toHaveBeenCalledWith(
        'posts',
        jasmine.any(Function)
      );
    });

    it('should call AngularFireDatabase list valueChanges', () => {
      serverService.getCollection('posts', null);

      expect(angularFireDatabase.listSpy.valueChanges).toHaveBeenCalled();
    });

    it('should map return as reversed array', () => {
      const pages = makeImmutable([
        { name: 'Page 1', status: { draft: true } },
        { name: 'Page 2', status: { draft: true } }
      ]);
      angularFireDatabase.listSpy.valueChanges.and.returnValue(of(pages));

      serverService.getCollection('pages', null).subscribe(pages => {
        const pageNames = pages.map(page => page.name);

        expect(pageNames).toEqual(['Page 2', 'Page 1']);
      });
    });

    describe('status: null', () => {
      beforeEach(() =>
        angularFireDatabase.listSpy.valueChanges.and.returnValue(
          of(Data.getPages())
        ));

      it('should return filtered page status as `draft` or `published`', () => {
        serverService
          .getCollection('pages', null)
          .subscribe(pages =>
            pages.map(page =>
              expect(page.status.draft || page.status.published).toBe(true)
            )
          );
      });
    });

    describe('status: `archived`', () => {
      beforeEach(() =>
        angularFireDatabase.listSpy.valueChanges.and.returnValue(
          of(Data.getPages())
        ));

      it('should return filtered page status as `archived`', () => {
        serverService
          .getCollection('pages', 'archived')
          .subscribe(pages =>
            pages.map(page => expect(page.status.archived).toBe(true))
          );
      });
    });
  });

  describe('getPage', () => {
    beforeEach(() => serverService.getPage('1'));

    it('should call AngularFireDatabase object', () => {
      expect(angularFireDatabase.object).toHaveBeenCalled();
    });

    it('should call AngularFireDatabase object with page path arg', () => {
      expect(angularFireDatabase.object).toHaveBeenCalledWith('pages/1');
    });

    it('should call AngularFireDatabase object valueChanges', () => {
      expect(angularFireDatabase.objectSpy.valueChanges).toHaveBeenCalled();
    });

    it('should filter falsy return values', () => {
      angularFireDatabase.objectSpy.valueChanges.and.callFake(() =>
        from([true, false, true, null])
      );

      const results = [];
      serverService.getPage('page1').subscribe(res => results.push(res));

      expect(results).toEqual([true, true]);
    });
  });

  describe('getBlocks', () => {
    beforeEach(() => serverService.getBlocks(Data.getPages('page-1')));

    it('should call AngularFireDatabase list', () => {
      expect(angularFireDatabase.list).toHaveBeenCalled();
    });

    it('should call AngularFireDatabase list with data path arg', () => {
      expect(angularFireDatabase.list).toHaveBeenCalledWith(
        'data/1/a',
        jasmine.any(Function)
      );
    });

    it('should call AngularFireDatabase list valueChanges', () => {
      expect(angularFireDatabase.listSpy.valueChanges).toHaveBeenCalled();
    });
  });

  describe('addPage', () => {
    beforeEach(() => serverService.addPage(Data.getPages('page-1')));

    it('should call AngularFireDatabase object', () => {
      expect(angularFireDatabase.object).toHaveBeenCalled();
    });

    it('should call AngularFireDatabase object with page id arg', () => {
      expect(angularFireDatabase.object).toHaveBeenCalledWith('pages/page-1');
    });

    it('should call AngularFireDatabase object set', () => {
      expect(angularFireDatabase.objectSpy.set).toHaveBeenCalled();
    });
  });

  describe('orderBlock', () => {
    beforeEach(() =>
      serverService.orderBlock(
        Data.getPages('page-1'),
        Data.getBlocks('text'),
        Data.getBlocks('image')
      ));

    it('should call AngularFireDatabase database ref', () => {
      expect(angularFireDatabase.databaseSpy.ref).toHaveBeenCalled();
    });

    it('should call AngularFireDatabase database ref with data path arg', () => {
      expect(angularFireDatabase.databaseSpy.ref).toHaveBeenCalledWith(
        'data/1/a'
      );
    });

    it('should call AngularFireDatabase database ref update', () => {
      expect(angularFireDatabase.databaseRefSpy.update).toHaveBeenCalled();
    });

    it('should call AngularFireDatabase database ref update with order changes', () => {
      expect(angularFireDatabase.databaseRefSpy.update).toHaveBeenCalledWith({
        '1/order': 1,
        '2/order': 2
      });
    });
  });

  describe('addBlock', () => {
    const block: Block.Base = makeImmutable({
      type: 'text',
      id: 'abc',
      order: 5
    });
    beforeEach(() => serverService.addBlock(Data.getPages('page-1'), block));

    it('should call AngularFireDatabase list', () => {
      expect(angularFireDatabase.list).toHaveBeenCalled();
    });

    it('should call AngularFireDatabase list with data path arg', () => {
      expect(angularFireDatabase.list).toHaveBeenCalledWith('data/1/a');
    });

    it('should call AngularFireDatabase list set', () => {
      expect(angularFireDatabase.listSpy.set).toHaveBeenCalled();
    });

    it('should call AngularFireDatabase list set with block id and block args', () => {
      expect(angularFireDatabase.listSpy.set).toHaveBeenCalledWith(
        'abc',
        block
      );
    });
  });

  describe('updatePage', () => {
    beforeEach(() =>
      serverService.updatePage(Data.getPages('page-1'), 'new-title'));

    it('should call HumanizePipe', () => {
      expect(humanizePipe).toHaveBeenCalled();
    });

    it('should call HumanizePipe with newId arg', () => {
      expect(humanizePipe).toHaveBeenCalledWith('new-title');
    });

    it('should call AngularFireDatabase database ref', () => {
      expect(angularFireDatabase.databaseSpy.ref).toHaveBeenCalled();
    });

    it(`should call AngularFireDatabase database ref with 'pages' arg`, () => {
      expect(angularFireDatabase.databaseSpy.ref).toHaveBeenCalledWith('pages');
    });

    it('should call AngularFireDatabase database ref update with replaced pages arg', () => {
      expect(angularFireDatabase.databaseRefSpy.update).toHaveBeenCalledWith({
        'new-title': {
          id: 'new-title',
          name: 'humanized: new-title',
          dataId: '1',
          revisions: {
            currentId: 'a'
          },
          status: {
            draft: true
          },
          lastModified: jasmine.anything()
        } as Page,
        'page-1': null
      });
    });
  });

  describe('updateUser', () => {
    const user: User = makeImmutable({
      id: 'xyz',
      colour: '#fff',
      current: {
        pageId: '1',
        blockId: 'a',
        data: {
          index: 1,
          length: 2
        }
      }
    });
    beforeEach(() => serverService.updateUser(Data.getPages('page-1'), user));

    it('should call AngularFireDatabase database ref', () => {
      expect(angularFireDatabase.databaseSpy.ref).toHaveBeenCalled();
    });

    it('should call AngularFireDatabase database ref with users path arg', () => {
      expect(angularFireDatabase.databaseSpy.ref).toHaveBeenCalledWith(
        'users/abcdefg'
      );
    });

    it('should call AngularFireDatabase database ref onDisconnect', () => {
      expect(
        angularFireDatabase.databaseRefSpy.onDisconnect
      ).toHaveBeenCalled();
    });

    it('should call AngularFireDatabase database ref onDisconnect remove', () => {
      expect(
        angularFireDatabase.databaseRefOnDisconnectSpy.remove
      ).toHaveBeenCalled();
    });

    it('should call AngularFireDatabase database ref update', () => {
      expect(angularFireDatabase.databaseRefSpy.update).toHaveBeenCalled();
    });

    it('should call AngularFireDatabase database ref update with merged user arg', () => {
      expect(angularFireDatabase.databaseRefSpy.update).toHaveBeenCalledWith({
        id: 'abcdefg',
        colour: jasmine.any(String),
        current: {
          ...user.current,
          pageId: 'page-1'
        }
      });
    });
  });

  xdescribe('getUsers', () => {});

  describe('updateBlock', () => {
    beforeEach(() =>
      serverService.updateBlock(
        Data.getPages('page-1'),
        Data.getBlocks('text'),
        Data.getTextBlockData()
      ));

    it('should call AngularFireDatabase list', () => {
      expect(angularFireDatabase.list).toHaveBeenCalled();
    });

    it('should call AngularFireDatabase list with data path arg', () => {
      expect(angularFireDatabase.list).toHaveBeenCalledWith('data/1/a/1/data');
    });

    it('should call AngularFireDatabase list set', () => {
      expect(angularFireDatabase.listSpy.set).toHaveBeenCalled();
    });

    it('should call AngularFireDatabase list set with data id and data args', () => {
      expect(angularFireDatabase.listSpy.set).toHaveBeenCalledWith(
        '1',
        Data.getTextBlockData()
      );
    });
  });

  describe('removePage', () => {
    beforeEach(() => serverService.removePage(Data.getPages('page-1')));

    it('should call AngularFireDatabase database ref', () => {
      expect(angularFireDatabase.databaseSpy.ref).toHaveBeenCalled();
    });

    it('should call AngularFireDatabase database ref update', () => {
      expect(angularFireDatabase.databaseRefSpy.update).toHaveBeenCalled();
    });

    it('should call AngularFireDatabase database ref update with page updates arg', () => {
      expect(angularFireDatabase.databaseRefSpy.update).toHaveBeenCalledWith({
        'pages/page-1': null,
        'data/1': null
      });
    });
  });

  describe('archivePage', () => {
    beforeEach(() => serverService.archivePage(Data.getPages('page-1')));

    it('should call AngularFireDatabase database ref', () => {
      expect(angularFireDatabase.databaseSpy.ref).toHaveBeenCalled();
    });

    it('should call AngularFireDatabase database ref with page status path', () => {
      expect(angularFireDatabase.databaseSpy.ref).toHaveBeenCalledWith(
        'pages/page-1/status'
      );
    });

    it('should call AngularFireDatabase database ref set', () => {
      expect(angularFireDatabase.databaseRefSpy.set).toHaveBeenCalled();
    });

    it('should call AngularFireDatabase database ref set with archived arg', () => {
      expect(angularFireDatabase.databaseRefSpy.set).toHaveBeenCalledWith({
        archived: true
      });
    });
  });

  describe('removeBlock', () => {
    beforeEach(() =>
      serverService.removeBlock(
        Data.getPages('page-1'),
        Data.getBlocks('text')
      ));

    it('should call AngularFireDatabase list', () => {
      expect(angularFireDatabase.list).toHaveBeenCalled();
    });

    it('should call AngularFireDatabase list with data path arg', () => {
      expect(angularFireDatabase.list).toHaveBeenCalledWith('data/1/a');
    });

    it('should call AngularFireDatabase list remove', () => {
      expect(angularFireDatabase.listSpy.remove).toHaveBeenCalled();
    });

    it('should call AngularFireDatabase list remove with block id arg', () => {
      expect(angularFireDatabase.listSpy.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('publishPage', () => {
    beforeEach(() => serverService.publishPage(Data.getPages('page-1')));

    it('should call ServerService createId', () => {
      expect(serverService.createId).toHaveBeenCalled();
    });

    it('should call AngularFireDatabase database ref', () => {
      expect(angularFireDatabase.databaseSpy.ref).toHaveBeenCalled();
    });

    it('should call AngularFireDatabase database ref with current data path arg', () => {
      expect(angularFireDatabase.databaseSpy.ref).toHaveBeenCalledWith(
        'data/1/a'
      );
    });

    it('should call AngularFireDatabase database ref once', () => {
      expect(angularFireDatabase.databaseRefSpy.once).toHaveBeenCalled();
    });

    it(`should call AngularFireDatabase database ref once with 'value' arg`, () => {
      expect(angularFireDatabase.databaseRefSpy.once).toHaveBeenCalledWith(
        'value'
      );
    });

    it('should call AngularFireDatabase database ref with new data path arg', () => {
      expect(angularFireDatabase.databaseSpy.ref).toHaveBeenCalledWith(
        'data/1/abcdefg'
      );
    });

    it('should call AngularFireDatabase database ref set', () => {
      expect(angularFireDatabase.databaseRefSpy.set).toHaveBeenCalled();
    });

    it('should call AngularFireDatabase database ref set with blocks arg', () => {
      expect(angularFireDatabase.databaseRefSpy.set).toHaveBeenCalledWith(
        Data.getBlocks()
      );
    });

    it('should call AngularFireDatabase database ref with pages path arg', () => {
      expect(angularFireDatabase.databaseSpy.ref).toHaveBeenCalledWith(
        'pages/page-1/'
      );
    });

    it('should call AngularFireDatabase database ref update', () => {
      expect(angularFireDatabase.databaseRefSpy.update).toHaveBeenCalled();
    });

    it('should call AngularFireDatabase database ref update with page update arg', () => {
      expect(angularFireDatabase.databaseRefSpy.update).toHaveBeenCalledWith({
        status: {
          draft: null,
          published: true
        },
        revisions: {
          publishedId: 'a',
          currentId: 'abcdefg'
        }
      });
    });
  });
});

function createService() {
  service = new ServerServiceStub();
  serverService = TestBed.get(ServerService);
  firebaseApp = TestBed.get(FirebaseApp);
  angularFireDatabase = TestBed.get(AngularFireDatabase);
  humanizePipe = spyOn(
    MockHumanizePipe.prototype,
    'transform'
  ).and.callThrough();
}

class ServerServiceStub {
  createId: jasmine.Spy;

  constructor() {
    this.createId = spyOn(
      ServerService.prototype,
      'createId'
    ).and.callThrough();
  }
}
