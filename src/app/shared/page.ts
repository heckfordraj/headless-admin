import { Block } from './block';

interface Revision {
  currentId: string;
  publishedId?: string;
}

export interface Page {
  readonly id: string;
  readonly name: string;
  readonly dataId: string;
  revisions: Revision;
}
