export class Text {
  type: string = 'text';

  constructor(
    public data: string
  ){}
}

export class Image {
  type: string = 'image';

  constructor(
    public url: string
  ){}
}

export class Page {

  constructor(
    public type: string,
    public id: string,
    public name: string,
    public data?: Array<any>,
    public slug?: string
  ){}
}
