interface Revision {
  currentId: string;
  publishedId?: string;
}

interface PageStatus {
  published?: true;
  draft?: true;
  archived?: true;
}

export interface Page {
  id: string;
  name: string;
  readonly dataId: string;
  revisions: Revision;
  lastModified: number | object;
  status: PageStatus;
}
