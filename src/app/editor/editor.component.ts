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

  publishPage() {
    this.serverService.publishPage(this.page);
  }

  updatePage(newname: string) {
    // TODO: check if newname
    // TODO: check if previous name and new name are identical
    // TODO: route only if promise resolves

    const newPage: Page = {
      id: slugify(newname),
      name: newname,
      dataId: this.page.dataId,
      revisions: { currentId: this.page.revisions.currentId }
    };

    this.serverService
      .updatePage(this.page, newPage)
      .then(_ => this.router.navigate(['/page', newPage.id]))
      .catch((err: any) => console.error(err));
  }

  removePage() {
    // TODO: add routing navigation back to /pages

    return this.serverService.removePage(this.page);
  }

  ngOnInit() {
    // TODO: ngFor index on id

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
