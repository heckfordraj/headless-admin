import * as functions from 'firebase-functions';
import * as Delta from 'quill-delta';

import { Block } from 'app/shared/block';

const MAX_OPS = 25;

exports.limitOps = functions.database
  .ref('/content/{blockId}/{textDataId}')
  .onWrite(change => {
    const parentRef = change.after.ref.parent;

    return parentRef
      .once('value')
      .then((snapshot: functions.database.DataSnapshot) => {
        if (MAX_OPS >= snapshot.numChildren()) return null;

        const content: { [id: string]: Block.Data.TextData } = {};
        let latestId: number;
        let combinedDelta: Quill.DeltaStatic = new Delta();

        snapshot.forEach(child => {
          content[child.key] = null;
          latestId = +child.key;

          const ops: Quill.DeltaOperation[] = (child.val() as Block.Data.TextData)
            .delta.ops;
          combinedDelta = combinedDelta.compose(new Delta(ops));

          return false;
        });

        content[latestId] = {
          delta: combinedDelta,
          id: latestId,
          user: 'server'
        };
        return parentRef.update(content);
      });
  });
