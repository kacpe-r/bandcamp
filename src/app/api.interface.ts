import { IItemDirty } from './item.interface';

export interface IResponse {
    event_type: string;
    items: IItemDirty[];
    utc_date: number;
}

export interface IGetData {
    feed_data: {
        data_delay_sec: number;
        end_date: number;
        events: IResponse[];
        server_time: number;
        start_date: number;
    };
}
