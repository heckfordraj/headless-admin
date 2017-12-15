export namespace Block {

export class text {
  type: string = 'text';
  data: string;

  constructor(
    public id: string
  ){}
}

export class image {
  type: string = 'image';
  url: string;

  constructor(
    public id: string
  ){}
}

}

export const Blocks = {
  data: [
    new Block['text'](undefined),
    new Block['image'](undefined)
  ]
}

export class Page {

  constructor(
    public type: string,
    public id: string,
    public name?: string,
    public data?: Array<any>,
    public slug?: string
  ){}
}
