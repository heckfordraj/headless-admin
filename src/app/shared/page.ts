import { Block } from './block';

export class Page {
  constructor(
    public type: string,
    public id: string,
    public name?: string,
    public data?: Block.Base[] | Block.Base,
    public slug?: string
  ) {}
}
