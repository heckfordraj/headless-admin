export interface TextData {
  user: number;
  ops: Quill.DeltaOperation[];
}

export interface Content {
  readonly id: string;
  title: string;
  data: TextData[];
}
