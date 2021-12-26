export interface IItemDirty {
    album_title: string;
    amount_paid: number;
    amount_paid_fmt: string;
    amount_paid_usd: number;
    art_id: number;
    art_url: string;
    artist_name: string;
    country: string;
    country_code: string;
    currency: string;
    item_description: string;
    item_price: number;
    item_type: string;
    package_image_id: any;
    releases: any;
    slug_type: string;
    track_album_slug_text: any;
    url: string;
    utc_date: number;
}

export interface IItem {
    url: string;
    artistName: string;
    albumTitle: string;
    itemDescription: string;
    utcDate: number;
    tags?: ITag[];
}

export interface ITag {
    tag_name: string;
    tag_url: string;
}
