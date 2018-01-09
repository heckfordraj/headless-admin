export namespace Block {

  export class Base {
    type: string;

    constructor(
      public id: string,
      public data: any[]
    ){}
  }

  export class BaseData {
    constructor(
      public text: string
    ){}
  }

  export class textdata extends BaseData {
    constructor(
      public text = null
    ){
      super(text)
    }
  }

  export class text extends Base {
    type: string = 'text';

    constructor(
      public id,
      public data: textdata[]
    ){
      super(id, data);
    }
  }

  export class imagedata {
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
    new Block['text'](null, [ new Block['textdata']() ]),
    new Block['image'](null)
  ]
}
