import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

import { ServerService } from '../shared/server.service';
import { Page } from '../shared/page';
import { Blocks, Block } from '../shared/block';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serverService: ServerService
  ) {}

  blocks: {} = Blocks;

  page$: Subscription;
  page: Page;

  // updatePage(name: string) {
  //   const pageUpdate = new Page('page', this.page.id, name);
  //
  //   this.serverService
  //     .updatePage(pageUpdate)
  //     .subscribe(
  //       (page: Page) => (this.page = page),
  //       (err: HttpErrorResponse) => console.log(err.statusText)
  //     );
  // }
  //
  // removePage() {
  //   this.serverService
  //     .removePage(this.page)
  //     .subscribe(
  //       () => (this.page = null),
  //       (err: HttpErrorResponse) => console.log(err.statusText)
  //     );
  // }
  //
  // addBlock(block: Block.Base) {
  //   const page = new Page('page', this.page.id, undefined, block);
  //
  //   this.serverService
  //     .addBlock(page)
  //     .subscribe(
  //       (block: Block.Base) => (<Block.Base[]>this.page.data).push(block),
  //       (err: HttpErrorResponse) => console.log(err.statusText)
  //     );
  // }
  //
  updateBlock(block: Block.Base) {
    return;
    //   const page = new Page('page', this.page.id, undefined, block);
    //
    //   this.serverService.updateBlock(page).subscribe(
    //     (block: Block.Base) =>
    //       (this.page.data = (<Block.Base[]>this.page.data).map(
    //         (blocks: Block.Base) => {
    //           if (blocks.id === block.id) {
    //             blocks = block;
    //           }
    //           return blocks;
    //         }
    //       )),
    //     (err: HttpErrorResponse) => console.log(err.statusText)
    //   );
  }
  //
  // removeBlock(block: Block.Base) {
  //   this.serverService
  //     .removeBlock(this.page, block)
  //     .subscribe(
  //       () =>
  //         (this.page.data = (<Block.Base[]>this.page.data).filter(
  //           (blocks: Block.Base) => blocks !== block
  //         )),
  //       (err: HttpErrorResponse) => console.log(err.statusText)
  //     );
  // }

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');

    this.page$ = this.serverService
      .getPage(slug)
      .subscribe((page: Page) => (this.page = page));
  }

  ngOnDestroy() {
    this.page$.unsubscribe();
  }
}
