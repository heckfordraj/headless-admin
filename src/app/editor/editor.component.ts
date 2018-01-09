import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { ServerService } from '../shared/server.service';
import { Page } from '../shared/page';
import { Blocks, Block } from '../shared/block';

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


  addFile(files: FileList) {

    this.serverService.addFile(files[0])
    .subscribe((res: any) => {

      console.log(res);
    });
  }

  updatePage(name: string){

    let pageUpdate = new Page('page', this.page.id, name);

    this.serverService.updatePage(pageUpdate)
    .subscribe(
      (page: Page) => this.page = page,
      (err: HttpErrorResponse) => {

        console.log(err.statusText)
      }
    )
  }

  removePage(){

    this.serverService.removePage(this.page)
    .subscribe(
      () => this.page = null,
      (err: HttpErrorResponse) => {

        console.log(err.statusText)
      }
    )
  }

  addBlock(block: any){

    let pageUpdate = new Page('page', this.page.id, undefined, block);

    this.serverService.addBlock(pageUpdate)
    .subscribe(
      (block: any) => this.page.data.push(block),
      (err: HttpErrorResponse) => {

        console.log(err.statusText)
      }
    )
  }

  updateBlock(block: any, blockUpdate: any[]){

    let blockBase = new Block[block.type](block.id);
    let pageUpdate = new Page('page', this.page.id, undefined, Object.assign(blockBase, { data: blockUpdate }));

    this.serverService.updateBlock(pageUpdate)
    .subscribe(
      (block: any) => this.page.data = this.page.data.map((blocks: any) => {

        if (blocks.id === block.id) {
          blocks = block;
        }

        return blocks;
      }),
      (err: HttpErrorResponse) => {

        console.log(err.statusText)
      }
    )
  }

  removeBlock(block: any){

    this.serverService.removeBlock(this.page, block)
    .subscribe(
      () => {

        this.page.data = this.page.data.filter((blocks: any) => blocks !== block)
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
