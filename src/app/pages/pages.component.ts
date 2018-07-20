import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { LoggerService, ServerService, SlugifyPipe, Page } from 'shared';

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
    private serverService: ServerService,
    private slugifyPipe: SlugifyPipe
  ) {}

  trackBy(index, page) {
    return page.id;
  }

  addPage(name: string) {
    // TODO: clear input on successful submit

    const newPage: Page = {
      id: this.slugifyPipe.transform(name),
      name: name,
      dataId: this.serverService.createId(),
      revisions: { currentId: this.serverService.createId() },
      lastModified: this.serverService.createTimestamp()
    };

    this.serverService
      .addPage(newPage)
      .then(_ => this.logger.log('addPage', `added page: ${newPage.name}`))
      .catch(err => this.logger.error('addPage', err));
  }

  removePage(page: Page) {
    this.serverService
      .removePage(page)
      .then(_ => this.logger.log('removePage', `removed page: ${page.name}`))
      .catch(err => this.logger.error('removePage', err));
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
