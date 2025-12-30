export interface Query {
    id?: string;
};

export interface SteamGameInfo {
    appid: number;
    name: string;
    img_icon_url: string;
    playtime_forever: number;
    rtime_last_played?: number;
}

export interface SteamAPIResponse {
    response: {
        games?: SteamGameInfo[];
    };
}

export interface GameInfo {
    id: string;
    name: string;
    icon: string;
    time_played: number;
    last_played?: string;
};