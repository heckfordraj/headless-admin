import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { AngularFirestore } from 'angularfire2/firestore';
import { slugify } from 'underscore.string';

import { ServerService } from '../shared/server.service';
import { Page } from '../shared/page';
import { Blocks, Block } from '../shared/block';
import * as firebase from 'firebase';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serverService: ServerService,
    private db: AngularFirestore
  ) {}

  blocks: {} = Blocks;

  page$: Subscription;
  page: Page;

  pageBlocks: Observable<Block.Base[]>;

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

  updatePage(newtitle: string) {
    const newPage: Page = { title: newtitle, id: slugify(newtitle) };
    this.serverService.updatePage(newPage, this.page.id);
  }
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
  addBlock(base: Block.Base) {
    const id = this.db.createId();
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    const block = { id: id, timestamp: timestamp, ...base };

    this.serverService.addBlock(this.page, block);
  }

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
    const id = this.route.snapshot.paramMap.get('id');

    this.page$ = this.serverService
      .getPage(id)
      .subscribe((page: Page) => (this.page = page));

    this.pageBlocks = this.serverService.getBlocks(id);
  }

  ngOnDestroy() {
    this.page$.unsubscribe();
  }
}
