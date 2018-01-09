export namespace Block {

  export namespace Data {

    export class TextData {
      constructor(
        public text: string = null
      ) { }
    }

    export class ImageData {
      constructor(
        public url: string = null
      ) { }
    }
  }

  export class Base {

    constructor(
      public type: string,
      public id: string,
      public data: any[]
    ) { }
  }

  export class Text extends Base {

    constructor(
      public id,
      public data: Data.TextData[],
      public type = 'text'
    ) {
      super(type, id, data);
    }
  }

  export class Image extends Base {

    constructor(
      public id,
      public data: Data.ImageData[],
      public type = 'image'
    ) {
      super(type, id, data);
    }
  }
}

export const Blocks = {
  data: [
    new Block.Text(null, [ new Block.Data.TextData() ]),
    new Block.Image(null, [ new Block.Data.ImageData() ])
  ]
};
