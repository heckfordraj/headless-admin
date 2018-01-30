import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';

import { Page } from './page';
import { Block } from './block';

export class AngularFireDatabaseStub {
  createPushId(): string {
    return 'abcdefg';
  }

  valueChanges() {
    return Observable.of(null);
  }

  list(path: string) {
    if (path) return { valueChanges: this.valueChanges };

    return { valueChanges: () => Observable.throw(new Error()) };
  }

  object(path: string) {
    if (path)
      return {
        valueChanges: this.valueChanges,
        set: () => Promise.resolve(null)
      };

    return {
      valueChanges: () => Observable.throw(new Error()),
      set: () => Promise.reject(new Error())
    };
  }

  database = {
    ref: (path: string) => {
      return { update: this.database.update };
    },
    update: (update: any) => Promise.resolve(null)
  };
}
