export namespace Block {

  class textdata {
    text: string = null;
  }

  export class text {
    type: string = 'text';

    constructor(
      public id: string,
      public data: textdata[] = []
    ){}
  }

  class imagedata {
    url: string = null;
  }

  export class image {
    type: string = 'image';

    constructor(
      public id: string,
      public data: imagedata[] = []
    ){}
  }

}

export const Blocks = {
  data: [
    new Block['text'](null),
    new Block['image'](null)
  ]
}
