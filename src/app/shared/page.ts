interface Revision {
  currentId: string;
  publishedId?: string;
}

export interface Page {
  id: string;
  name: string;
  readonly dataId: string;
  revisions: Revision;
  lastModified: number | object;
}
