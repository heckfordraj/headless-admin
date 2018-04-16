export namespace Block {
  export namespace Data {
    export interface Base {
      id: string | number;
    }

    export interface TextData extends Base {
      id: number;
      user: string;
      delta?: Quill.DeltaStatic;
    }

    export interface ImageData extends Base {
      alt: string;
      url: string;
    }
  }

  export interface Base {
    readonly id: string;
    type: string;
    order: number;
  }
}

export const Blocks: { data: any[] } = {
  data: [{ type: 'text' }, { type: 'image' }]
};
