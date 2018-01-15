import { Block } from './block';

export interface Page {
  title: string;
  slug: string;
  data?: Block.Base[] | Block.Base;
}
