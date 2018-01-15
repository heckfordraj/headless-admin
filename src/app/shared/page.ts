import { Block } from './block';

export interface Page {
  id: string;
  title: string;
  data?: Block.Base[] | Block.Base;
}
