import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { LoggerService, ServerService, SlugifyPipe, Page } from 'shared';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit, OnDestroy {
  pages$: Subscription;
  pages: Page[];

  pagesStatus$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  constructor(
    private logger: LoggerService,
    private serverService: ServerService,
    private slugifyPipe: SlugifyPipe
  ) {}

  trackBy(_index, page) {
    return page.id;
  }

  addPage(name: string) {
    // TODO: clear input on successful submit

    const newPage: Page = {
      id: this.slugifyPipe.transform(name),
      name: name,
      dataId: this.serverService.createId(),
      revisions: { currentId: this.serverService.createId() },
      lastModified: this.serverService.createTimestamp(),
      status: {
        draft: true
      }
    };

    this.serverService
      .addPage(newPage)
      .then(_ => this.logger.log('addPage', `added page: ${newPage.name}`))
      .catch(err => this.logger.error('addPage', err));
  }

  archivePage(page: Page) {
    this.serverService
      .archivePage(page)
      .then(_ => this.logger.log('archivePage', `archived page: ${page.name}`))
      .catch(err => this.logger.error('archivePage', err));
  }

  removePage(page: Page) {
    this.serverService
      .removePage(page)
      .then(_ => this.logger.log('removePage', `removed page: ${page.name}`))
      .catch(err => this.logger.error('removePage', err));
  }

  filterPages(status: string = null) {
    this.logger.log('filterPages', status);

    this.pagesStatus$.next(status);
  }

  ngOnInit() {
    this.pages$ = this.pagesStatus$
      .pipe(
        switchMap(status => this.serverService.getCollection('pages', status))
      )
      .subscribe((pages: Page[]) => (this.pages = pages));
  }

  ngOnDestroy() {
    this.pages$.unsubscribe();
    this.pagesStatus$.unsubscribe();
  }
}
