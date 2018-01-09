export namespace Block {

  export class Base {

    constructor(
      public type: string,
      public id: string,
      public data: any[]
    ){}
  }

export namespace Data {

  export class Base {
    constructor(
      public text: string
    ){}
  }

  export class TextData extends Base {
    constructor(
      public text = null
    ){
      super(text)
    }
  }

}





  export class Text extends Base {

    constructor(
      public id,
      public data: Data.TextData[],
      public type = 'text'
    ){
      super(type, id, data);
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
    new Block.Text(null, [ new Block.Data.TextData() ]),
    new Block['image'](null)
  ]
}
