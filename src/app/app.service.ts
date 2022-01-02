import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IGetData, IResponse } from './api.interface';
import { delay, map, retryWhen, take } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ITag } from './item.interface';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  constructor(private http: HttpClient) {}

  public getData(): Observable<IResponse[]> {
    const url = 'https://bandcamp.com/api/salesfeed/1/get_initial';
    return this.http.get(url).pipe(map((response: IGetData) => {
      return response.feed_data.events;
    }));
  }

  public getTags(url: string): Observable<ITag[]> {
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
}
