import { GetUserType } from "../db";
import { ObjectId } from "mongodb";
import jwt from 'jsonwebtoken'
import { settings } from "../settings";




export const jwtService = {
    async createJWT(user: GetUserType) {
        const token = jwt.sign({userId: user.id}, settings.JWT_SECRET, {expiresIn: "5m"})
        return token
    },
    async getUserIdByToken(token: string) {
        try {
            const result: any = jwt.verify(token, settings.JWT_SECRET)
            return new ObjectId(result.userId)
        } catch(error) {
            return null
        }
    }
}   


export const tokenService = {
    async createRefreshToken(user: GetUserType, deviceId: string) {
        const Refreshtoken = jwt.sign({ userId: user.id, deviceId: deviceId }, settings.Refresh_Secret, {expiresIn: "5m"})
        return Refreshtoken
    },
    async getUserIdByToken(token: string) {
        try {
            const result: any = jwt.verify(token, settings.Refresh_Secret)
            return new ObjectId(result.userId)
        } catch(error) {
            return null
        }
    }, 
    async getDeviceIdByToken(token: string) {
        try {
            const result: any = jwt.verify(token, settings.Refresh_Secret)
            return result.deviceId
        } catch(error) {
            return null
        }
    }
}  