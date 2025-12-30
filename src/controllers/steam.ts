import { Request, Response } from 'express';
import SteamService from '@services/steam';

export default class SteamController {
    static async handler(req: Request, res: Response): Promise<void> {
        const steam: SteamService = new SteamService();
        res.ok(await steam.handle(req.params.method, req.query) as object);
    };
}