import fetch from 'node-fetch';
import config from '@media-master/load-dotenv';
import errors from '@media-master/http-errors';
import {
    Query,
    SteamGameInfo,
    SteamAPIResponse,
    GameInfo,
} from '@types';

export default class SteamService {
    private mapGame = (steamGameInfo: SteamGameInfo): GameInfo => {
        const cleanedName = steamGameInfo.name
            .replaceAll(/™/g, '')
            .replaceAll(/®/g, '')
            .replaceAll(/GOTY Edition/g, 'Game of The Year Edition')
            .replaceAll(/GOTY/g, '')
            .replaceAll(/Single Player/g, '')
            .replaceAll(/\(.*?\)/g, '')
            .replaceAll(/’/g, '\'')
            .trim();

        return {
            id: steamGameInfo.appid.toString(),
            name: cleanedName,
            icon: `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/${steamGameInfo.appid}/${steamGameInfo.img_icon_url}.jpg`,
            time_played: steamGameInfo.playtime_forever,
            last_played: this.getDate(steamGameInfo.rtime_last_played ?? 0) ?? '',
        };
    };

    private request = async <T>(userId: string): Promise<T | undefined> => {
        const url = new URL(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${config.STEAM_API_KEY}&steamid=${userId}&include_appinfo=true`);

        const response = await fetch(url);
        if (!response.ok) return undefined;

        const body = (await response.json()) as SteamAPIResponse;
        const games = body.response?.games;

        if (!games || games.length === 0) return undefined;

        return games as T;
    };

    private getDate(timestampInSeconds: number): (string | undefined) {
        if (timestampInSeconds === 0) {
            return undefined;
        }
        const date = new Date(timestampInSeconds * 1000);
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }

    private getImport = async (userId: string): Promise<GameInfo[]> => {
        const steamGames = await this.request<SteamGameInfo[]>(userId);
        if (!steamGames || steamGames.length === 0) return [];

        const filteredGames = steamGames.filter((game) => {
            const name = game.name.toLowerCase();
            return !name.includes('public test') &&
                !name.includes('multiplayer') &&
                !name.includes('open beta');
        });

        filteredGames.sort((a, b) => a.name.localeCompare(b.name));
        return filteredGames.map(this.mapGame);
    };

    public handle = async (method: string, query: Query): Promise<unknown> => {
        const methodMap: Record<string, (param: string) => Promise<unknown>> = {
            import: this.getImport,
        };

        if (!(method in methodMap)) {
            throw errors.notFound(
                'Invalid endpoint! Use /[import]'
            );
        }

        const param = query['id'];
        if (param === undefined) throw errors.badRequest(`Missing parameter for the ${method} endpoint`);

        return await methodMap[method](param);
    };
}
