import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { switchMap, map, tap } from 'rxjs/operators';
import { combineLatest } from 'rxjs/observable/combineLatest';

import { LoggerService } from '../shared/logger.service';
import { ServerService } from '../shared/server.service';
import { SlugifyPipe } from '../shared/slugify.pipe';
import { Page } from '../shared/page';
import { User, TextUserData } from '../shared/user';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  providers: [SlugifyPipe]
})
export class EditorComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private logger: LoggerService,
    private serverService: ServerService,
    private slugify: SlugifyPipe
  ) {}

  page$: Subscription;
  page: Page;

  users: User[];

  inputSlug: string;

  slugChange(input: string) {
    this.inputSlug = this.slugify.transform(input);
  }

  publishPage() {
    // TODO: add visible publish status (check if doc has changed)

    return this.serverService
      .publishPage(this.page)
      .then(_ => this.logger.log('publishPage', 'published page'))
      .catch(err => this.logger.error('publishPage', err));
  }

  updatePage() {
    if (!this.inputSlug || this.page.id === this.inputSlug) return;

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
    return this.serverService
      .removePage(this.page)
      .then(_ => this.router.navigate(['/pages'], { replaceUrl: true }))
      .then(_ => this.logger.log('removePage', 'removed page'))
      .catch(err => this.logger.error('removePage', err));
  }

  ngOnInit() {
    this.page$ = this.route.paramMap
      .switchMap((param: ParamMap) =>
        combineLatest(
          this.serverService
            .getPage(param.get('id'))
            .pipe(tap(page => this.serverService.updateUser(page))),
          this.serverService
            .getUsers()
            .pipe(
              map(users =>
                users.filter(user => user.current.pageId === param.get('id'))
              )
            )
        )
      )
      .subscribe(([page, users]) => {
        this.page = page;
        this.users = users;
      });
  }

  ngOnDestroy() {
    this.page$.unsubscribe();
  }
}
