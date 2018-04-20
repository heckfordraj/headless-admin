import { Block } from './block';

interface Revision {
  currentId: string;
  publishedId?: string;
}

export interface TextUser {
  index?: number;
  length?: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  width?: number;
  height?: number;
}

export interface User {
  id: string;
  colour: string;
  currentBlockId?: string;
  data?: TextUser;
}

export interface Page {
  id: string;
  name: string;
  readonly dataId: string;
  revisions: Revision;
  lastModified: number | object;
  users?: { [id: string]: User } | User[];
}
