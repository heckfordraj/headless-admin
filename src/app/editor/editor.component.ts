import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { ServerService } from '../server.service';
import { Page, Blocks, Block } from '../page';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serverService: ServerService
  ) { }

  blocks: {} = Blocks;

  page: Page;


  updatePage(page: Page, name: string){

    let pageUpdate = new Page('page', page.id, name);

    this.serverService.updatePage(pageUpdate)
    .subscribe(
      (page: Page) => this.page = page,
      (err: HttpErrorResponse) => {

        console.log(err.statusText)
      }
    )
  }

  removePage(page: Page){

    this.serverService.removePage(page)
    .subscribe(
      () => this.page = null,
      (err: HttpErrorResponse) => {

        console.log(err.statusText)
      }
    )
  }

  addBlock(page: Page, block: any){

    let pageUpdate = new Page('page', page.id, undefined, block);

    this.serverService.addBlock(pageUpdate)
    .subscribe(
      (page: Page) => this.page = page,
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
      (page: Page) => this.page = page,
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

  ngOnInit() {

    let id = this.route.snapshot.paramMap.get('id');

    this.serverService.getPages(id)
    .subscribe((page: Page) => this.page = page)
  }

}
