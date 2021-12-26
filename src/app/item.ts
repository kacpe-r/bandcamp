import { IItem, ITag } from './item.interface';

export class Item implements IItem {
    url: string;
    artistName: any;
    albumTitle: any;
    itemDescription: any;
    artUrl: any;
    utcDate: number;
    tags: ITag[];
    backgroundColor: string;
    textColor: string;

    constructor(
        url: string,
        artistName: string,
        albumTitle: string,
        itemDescription: string,
        artUrl: string,
        utcDate: number,
        tags?: ITag[],
        backgroundColor?: string,
        textColor?: string,
    ) {
        this.url = url;
        this.artistName = artistName;
        this.albumTitle = albumTitle;
        this.itemDescription = itemDescription;
        this.artUrl = artUrl;
        this.utcDate = utcDate;
        this.tags = tags;
        this.backgroundColor = backgroundColor;
        this.textColor = textColor;
    }
}
