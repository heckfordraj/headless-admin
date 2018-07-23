import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';

import { Page } from './page';
import { Block } from './block';
import { Data } from './data';

export { AngularFireDatabase } from 'angularfire2/database';

export class MockAngularFireDatabase {
  listSpy: { [name: string]: jasmine.Spy } = {};
  objectSpy: { [name: string]: jasmine.Spy } = {};
  databaseSpy: { [name: string]: jasmine.Spy } = {};
  databaseRefSpy: { [name: string]: jasmine.Spy } = {};
  databaseRefOnDisconnectSpy: { [name: string]: jasmine.Spy } = {};

  private listFn = {
    valueChanges: () => Observable.of(null),
    stateChanges: () => Observable.of(null),
    set: () => Promise.resolve(),
    remove: () => Promise.resolve()
  };

  private objectFn = {
    valueChanges: () => Observable.of(null),
    set: () => Promise.resolve()
  };

  private databaseRefOnDisconnectFn = {
    remove: () => Promise.resolve()
  };

  private databaseRefFn = {
    update: () => Promise.resolve(),
    set: () => Promise.resolve(),
    once: () => Promise.resolve({ val: () => Data.Blocks }),
    onDisconnect: () => this.databaseRefOnDisconnectFn
  };

  database = {
    ref: () => this.databaseRefFn
  };

  constructor() {
    this.createPushId = spyOn(this, 'createPushId').and.callThrough();
    this.list = spyOn(this, 'list').and.callThrough();
    this.listSpy.valueChanges = spyOn(
      this.listFn,
      'valueChanges'
    ).and.callThrough();
    this.listSpy.stateChanges = spyOn(
      this.listFn,
      'stateChanges'
    ).and.callThrough();
    this.listSpy.set = spyOn(this.listFn, 'set').and.callThrough();
    this.listSpy.remove = spyOn(this.listFn, 'remove').and.callThrough();
    this.object = spyOn(this, 'object').and.callThrough();
    this.objectSpy.valueChanges = spyOn(
      this.objectFn,
      'valueChanges'
    ).and.callThrough();
    this.objectSpy.set = spyOn(this.objectFn, 'set').and.callThrough();
    this.databaseSpy.ref = spyOn(this.database, 'ref').and.callThrough();
    this.databaseRefSpy.update = spyOn(
      this.databaseRefFn,
      'update'
    ).and.callThrough();
    this.databaseRefSpy.set = spyOn(
      this.databaseRefFn,
      'set'
    ).and.callThrough();
    this.databaseRefSpy.once = spyOn(
      this.databaseRefFn,
      'once'
    ).and.callThrough();
    this.databaseRefSpy.onDisconnect = spyOn(
      this.databaseRefFn,
      'onDisconnect'
    ).and.callThrough();
    this.databaseRefOnDisconnectSpy.remove = spyOn(
      this.databaseRefOnDisconnectFn,
      'remove'
    ).and.callThrough();
  }

  createPushId(): string {
    return 'abcdefg';
  }

  list(path: string) {
    return this.listFn;
  }

  object(path: string) {
    return this.objectFn;
  }
}
