import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { ServerService } from '../server.service';
import { Page } from '../page';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit {

    constructor(
      private serverService: ServerService
    ){}

    pages: Page[] = [];


    addPage(type: string, name: string){

      let page = new Page(type, 'id', name);

      this.serverService.addPage(page)
      .subscribe(
        (page: Page) => {

          console.log(page);
          this.pages.push(page);
        },
        (err: HttpErrorResponse) => {

          console.log(err.statusText)
        }
      )
    }

    updatePage(page: Page, name: string){

      let pageUpdate = new Page('page', page.id, name);

      this.serverService.updatePage(pageUpdate)
      .subscribe(
        (page: Page) => {

          this.pages = this.pages.map((pages: Page) => {

            if (pages.id === page.id) {
              pages = page;
            }

            return pages;
          })
        },
        (err: HttpErrorResponse) => {

          console.log(err.statusText)
        }
      )
    }

    removePage(page: Page){

      this.serverService.removePage(page)
      .subscribe(
        () => {

          this.pages = this.pages.filter((pages: Page) => pages !== page)
        },
        (err: HttpErrorResponse) => {

          console.log(err.statusText)
        }
      )
    }

    ngOnInit(){

      this.serverService.getPages()
      .subscribe((page: Page) => {

        console.log(page);
        this.pages.push(page);
      })
    }

  }
