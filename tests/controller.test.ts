import runImportTests, { Fields } from '@media-master/import-service-tests';
import { Express } from 'express';
import { describe, it, expect } from 'vitest';
import app from '../src/app';

const server = app as Express;

describe('Controller', () => {
    const endpoint: string = '';
    const validIds: string[] = [
        '76561199067194369',
        '76561198335146669',
        '76561198840472293',
    ];
    const invalidIds: string[] = [
        '-1',
        'Not an id',
        'nonExistentId',
    ];
    const fields: Fields = {
        id: { type: 'string' },
        name: { type: 'string' },
        icon: { type: 'string' },
        time_played: { type: 'number' },
        last_played: { type: 'string', nullable: true },
    };
    runImportTests(
        server,
        endpoint,
        { validIds, invalidIds, fields }
    );
});