import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { ServerService } from '../server.service';
import { Page, Blocks, Block } from '../page';

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

    blocks: {} = Blocks;


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

    addBlock(page: Page, block: any){

      let pageUpdate = new Page('page', page.id, undefined, block);

      this.serverService.addBlock(pageUpdate)
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

    updateBlock(page: Page, block: any, blockUpdate: {}){

      let blockBase = new Block[block.type](block._id);
      let pageUpdate = new Page('page', page.id, undefined, Object.assign(blockBase, blockUpdate));

      this.serverService.updateBlock(pageUpdate)
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

    removeBlock(page: Page, block: any){

      this.serverService.removeBlock(page, block)
      .subscribe(
        () => {

          page.data = page.data.filter((blocks: any) => blocks !== block)
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
