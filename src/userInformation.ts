import express, {Request, Response, Router} from "express"
import { GetUserType, UserLoginInformation, collection6 } from "./db";
import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from 'uuid';





export const socialRepositoryForIP= { 
    async IP(req: Request): Promise<string | undefined | string[]> {
        const parseIp = req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress ||
        null;
        if (!parseIp) {
            return undefined;
        }
        return parseIp
    }
};


export const socialRepositoryForLoginInformation = { 
    async createInfo(title: string, ip: string | string[], userId: ObjectId): Promise<UserLoginInformation | undefined> {
        if (!title.trim()) {
            return undefined;
        }
        const uuid = uuidv4()
        const createdAt1 = new Date().toISOString();
        const result = await collection6.insertOne({
            ip: ip,
            title: title,
            userId: userId,
            lastActiveDate: createdAt1,
            deviceId: uuid
        });
        return {
            ip: ip,
            title: title,
            userId: userId,
            lastActiveDate: createdAt1,
            deviceId: uuid
        };
    }
};

export const socialRepositoryForLoginInformation2 = { 
    async createInfo2(title: string, ip: string | string[], userId: ObjectId, deviceId2:string): Promise<UserLoginInformation | undefined> {
        if (!title.trim()) {
            return undefined;
        }
        const uuid = uuidv4()
        const createdAt1 = new Date().toISOString();
        const result = await collection6.insertOne({
            ip: ip,
            title: title,
            userId: userId,
            lastActiveDate: createdAt1,
            deviceId: deviceId2
        });
        return {
            ip: ip,
            title: title,
            userId: userId,
            lastActiveDate: createdAt1,
            deviceId: deviceId2
        };
    }
};


