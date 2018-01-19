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

  updatePage(newname: string) {
    const newPage: Page = {
      id: slugify(newname),
      name: newname,
      data: this.page.data
    };

    this.serverService
      .updatePage(this.page, newPage)
      .then(_ => this.router.navigate(['/page', newPage.id]))
      .catch((err: any) => console.error(err));
  }

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
