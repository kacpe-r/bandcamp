import { Observable, interval, from } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { concatMap, flatMap, map, retryWhen, delay, take } from 'rxjs/operators';
import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Item } from './item';
import ColorThief from 'colorthief';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private http: HttpClient) { }

  public items: IItem[] = [];
  public allElementsCounter: number;
  public tags$: Observable<any>;
  public tags: ITag[];
  @ViewChildren('elReference') elReference: QueryList<ElementRef>;

  ngOnInit() {
    const data$: Observable<IResponse[]> = this.getData();
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

              this.tags$ = this.getTags(itemUrl);
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
        flatMap(() => parsedData$)
      ).subscribe();
  }

  paidMoreThanMinimum(itemDirty: IItemDirty): boolean {
    return this.changeToDec(itemDirty.amount_paid) > this.changeToDec(itemDirty.item_price);
  }

  changeToDec(price: number): number {
    return Number(price.toFixed(2));
  }

  getData(): Observable<IResponse[]> {
    const url = 'https://bandcamp.com/api/salesfeed/1/get_initial';
    return this.http.get(url).pipe(map((response: IGetData) => {
      return response.feed_data.events;
    }));
  }

  getTags(url: string): Observable<ITag[]> {
    return this.http.get(url, {responseType: 'text'}).pipe(
      take(1),
      map(html => {
        return [...html.matchAll(/\a class\=\"tag\" href\=\"(.*)\".*\n.*>(.*)</g)].map((tag) => {
          return {
            tag_url: tag[1],
            tag_name: tag[2]
          };
        });
      }),
      retryWhen(errors =>
        errors.pipe(
          delay(5000)
        )
      )
    );
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
