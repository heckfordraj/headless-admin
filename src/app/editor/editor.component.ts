import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { switchMap } from 'rxjs/operators';

import { LoggerService } from '../shared/logger.service';
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
    private logger: LoggerService,
    private serverService: ServerService
  ) {}

  page$: Subscription;
  page: Page;

  inputSlug: string;

  publishPage() {
    // TODO: add visible publish status (check if doc has changed)

    return this.serverService
      .publishPage(this.page)
      .then(_ => this.logger.log('publishPage', 'published page'))
      .catch(err => this.logger.error('publishPage', err));
  }

  updatePage() {
    // TODO: check if newname
    // TODO: check if previous name and new name are identical
    // TODO: route only if promise resolves

    this.serverService
      .updatePage(this.page, this.inputSlug)
      .then(_ =>
        this.router.navigate(['/page', this.inputSlug], { replaceUrl: true })
      )
      .then(_ =>
        this.logger.log(
          'updatePage',
          `updated page: ${this.page.name} to: ${this.inputSlug}`
        )
      )
      .catch(err => this.logger.error('updatePage', err));
  }

  removePage() {
    // TODO: add routing navigation back to /pages

    return this.serverService
      .removePage(this.page)
      .then(_ => this.logger.log('removePage', 'removed page'))
      .catch(err => this.logger.error('removePage', err));
  }

  ngOnInit() {
    // TODO: ngFor index on id

    this.page$ = this.route.paramMap
      .switchMap((param: ParamMap) =>
        this.serverService.getPage(param.get('id'))
      )
      .subscribe((page: Page) => (page ? (this.page = page) : undefined));
  }

  ngOnDestroy() {
    this.page$.unsubscribe();
  }
}
