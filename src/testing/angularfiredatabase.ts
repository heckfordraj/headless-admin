import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';

import { Page } from './page';
import { Block } from './block';

export class AngularFireDatabaseStub {
  createPushId(): string {
    return 'abcdefg';
  }

  list(path: string) {
    if (path) return { valueChanges: () => Observable.of(null) };

    return { valueChanges: () => Observable.throw(new Error()) };
  }
}
