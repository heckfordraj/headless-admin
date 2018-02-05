import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { slugify } from 'underscore.string';

import { LoggerService } from '../shared/logger.service';
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

  constructor(
    private logger: LoggerService,
    private serverService: ServerService
  ) {}

  addPage(name: string) {
    // TODO: add last modified timestamp
    // TODO: clear input on successful submit

    const newPage: Page = {
      id: slugify(name),
      name: name,
      dataId: this.serverService.createId(),
      revisions: { currentId: this.serverService.createId() }
    };
    return this.serverService
      .addPage(newPage)
      .then(_ => this.logger.log('addPage', `added page: ${newPage.name}`))
      .catch(err => this.logger.error('addPage', err));
  }

  removePage(page: Page) {
    return this.serverService
      .removePage(page)
      .then(_ => this.logger.log('removePage', `removed page: ${page.name}`))
      .catch(err => this.logger.error('removePage', err));
  }

  ngOnInit() {
    // TODO: order by last modified timestamp
    // TODO: ngFor index on id

    this.pages$ = this.serverService
      .getCollection('pages')
      .subscribe((pages: Page[]) => (this.pages = pages));
  }

  ngOnDestroy() {
    this.pages$.unsubscribe();
  }
}
