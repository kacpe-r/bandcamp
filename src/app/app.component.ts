import { Observable, interval, from } from 'rxjs';
import { concatMap, mergeMap, map } from 'rxjs/operators';
import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Item } from './item';
import ColorThief from 'colorthief';
import { IItem, IItemDirty, ITag } from './item.interface';
import { IResponse } from './api.interface';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private service: AppService) { }

  public items: IItem[] = [];
  public allElementsCounter: number;
  public tags$: Observable<any>;
  public tags: ITag[];
  @ViewChildren('elReference') elReference: QueryList<ElementRef>;

  ngOnInit() {
    const data$: Observable<IResponse[]> = this.service.getData();
    const parsedData$: Observable<void> = data$.pipe(
      concatMap(data => from(data)),
      map((response: IResponse) => {
          for (const itemDirty of response.items) {
            if (this.paidMoreThanMinimum(itemDirty)) {
              const itemUrl = 'https://' + itemDirty.url.split('//')[1];
              const singleItem = new Item(
                itemUrl,
                itemDirty.artist_name,
                itemDirty.album_title,
                itemDirty.item_description,
                itemDirty.art_url,
                itemDirty.utc_date
              );

              this.setColors(singleItem, itemDirty);

              this.tags$ = this.service.getTags(itemUrl);
              this.tags$.subscribe((tags) => {
                singleItem.tags = tags;
              });

              if (!this.items.find(knownItem => knownItem.utcDate === singleItem.utcDate)) {
                this.items.push(singleItem);
                this.allElementsCounter = this.items.length;
              }
            }
          }
      })
    );

    interval(10000)
      .pipe(
        mergeMap(() => parsedData$)
      ).subscribe();
  }

  paidMoreThanMinimum(itemDirty: IItemDirty): boolean {
    return this.changeToDec(itemDirty.amount_paid) > this.changeToDec(itemDirty.item_price);
  }

  changeToDec(price: number): number {
    return Number(price.toFixed(2));
  }

  goToUrl(url: string): Window {
    return open(url);
  }

  toRgbColor(rgbx: number[]): string {
    return `rgb(${rgbx}, 1)`;
  }

  setColors(singleItem: Item, itemDirty: IItemDirty): void {
    const img = new Image();
    const colorThief = new ColorThief();
    img.addEventListener('load', () => {
      const mostPopularColors = colorThief.getPalette(img);
      singleItem.backgroundColor = this.toRgbColor(mostPopularColors[0]);
      singleItem.textColor = this.toRgbColor(mostPopularColors[mostPopularColors.length - 1]);

      this.setColorCSS(singleItem);
    });

    img.crossOrigin = 'Anonymous';
    img.src = itemDirty.art_url;
  }

  setColorCSS(singleItem: Item) {
    document.getElementById(singleItem.utcDate.toString()).style.color = singleItem.textColor;
    document.getElementById(singleItem.utcDate.toString()).style.backgroundColor = singleItem.backgroundColor;
  }
}
