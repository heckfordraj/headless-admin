import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { switchMap } from 'rxjs/operators';

import { slugify } from 'underscore.string';

import { ServerService } from '../shared/server.service';
import { Page } from '../shared/page';

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

  updatePage(newtitle: string) {
    const newPage: Page = {
      id: slugify(newtitle),
      title: newtitle,
      data: this.page.data
    };

    this.serverService
      .updatePage(this.page, newPage)
      .then(_ => this.router.navigate(['/page', newPage.id]))
      .catch((err: any) => console.error(err));
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

  // updateBlock(block: Block.Base) {
  // return;
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
  // }
  //

  ngOnInit() {
    this.page$ = this.route.paramMap
      .switchMap((param: ParamMap) =>
        this.serverService.getPage(param.get('id'))
      )
      .subscribe((page: Page) => (this.page = page));
  }

  ngOnDestroy() {
    this.page$.unsubscribe();
  }
}
