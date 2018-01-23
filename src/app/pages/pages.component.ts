import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { slugify } from 'underscore.string';

import { ServerService } from '../shared/server.service';
import { Page } from '../shared/page';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit, OnDestroy {
  pages$: Subscription;
  pages: Page[];

  constructor(private serverService: ServerService) {}

  updatePage(page: Page, newname: string) {
    const newPage: Page = {
      id: slugify(newname),
      name: newname,
      dataId: page.dataId,
      revisions: { currentId: page.revisions.currentId }
    };
    this.serverService.updatePage(page, newPage);
  }

  addPage(name: string) {
    const newPage: Page = {
      id: slugify(name),
      name: name,
      dataId: this.serverService.createId(),
      revisions: { currentId: this.serverService.createId() }
    };
    this.serverService.addPage(newPage);
  }

  ngOnInit() {
    this.pages$ = this.serverService
      .getCollection('pages')
      .subscribe((pages: Page[]) => (this.pages = pages));
  }

  ngOnDestroy() {
    this.pages$.unsubscribe();
  }
}
