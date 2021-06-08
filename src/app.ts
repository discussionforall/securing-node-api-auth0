import express, {Response, Request, NextFunction, Errback} from 'express';
import cors from 'cors'
import { config } from "dotenv";
import jwt from "express-jwt";
import {expressJwtSecret} from "jwks-rsa"

config();

if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_AUDIENCE || !process.env.ORIGIN) {
    throw new Error('Please provide AUTH0_DOMAIN, AUTH0_AUDIENCE and ORIGIN in .env file')
}

const app = express();

const corsOptions = {
    origin: process.env.ORIGIN
};

app.use(cors(corsOptions));

const checkJwt = jwt({
    secret: expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
    }),
    audience: process.env.AUTH0_DOMAIN,
    issuer: [process.env.AUTH0_DOMAIN],
    algorithms: ['RS256']
});

app.get('/api/public', (req: Request, res: Response) => {
    res.json({
        message: 'This is a public endpoint'
    });
});

app.get('/api/private', checkJwt, (req: Request, res: Response) => {
    res.json({
        message: 'This is a private endpoint'
    });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.log(err.stack);
    return res.status(err.status).json({message: err.message})
});

export { app }
