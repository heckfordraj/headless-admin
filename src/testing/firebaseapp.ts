export { FirebaseApp } from 'angularfire2';

export class MockFirebaseApp {
  databaseSpy: { [name: string]: jasmine.Spy } = {};
  databaseRefSpy: { [name: string]: jasmine.Spy } = {};

  private databaseRefFn = {
    update: () => Promise.resolve(),
    once: () => Promise.resolve(),
    set: () => Promise.resolve(),
    transaction: () => Promise.resolve()
  };

  refFn = {
    ref: () => this.databaseRefFn
  };

  constructor() {
    this.database = spyOn(this, 'database').and.callThrough();
    this.databaseSpy.ref = spyOn(this.refFn, 'ref').and.callThrough();
    this.databaseRefSpy.update = spyOn(
      this.databaseRefFn,
      'update'
    ).and.callThrough();
    this.databaseRefSpy.once = spyOn(
      this.databaseRefFn,
      'once'
    ).and.callThrough();
    this.databaseRefSpy.set = spyOn(
      this.databaseRefFn,
      'set'
    ).and.callThrough();
    this.databaseRefSpy.transaction = spyOn(
      this.databaseRefFn,
      'transaction'
    ).and.callThrough();
  }

  database() {
    return this.refFn;
  }
}
