export namespace Block {
  export namespace Data {
    export interface Base {
      id: string | number;
    }

    export interface TextData extends Base {
      user: string;
      ops: Quill.DeltaOperation[];
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
