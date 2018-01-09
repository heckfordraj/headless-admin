export class Page {

  constructor(
    public type: string,
    public id: string,
    public name?: string,
    public data?: Array<any>,
    public slug?: string
  ){}
}
