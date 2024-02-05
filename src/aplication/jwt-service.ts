import { GetUserType } from "../db";
import { ObjectId } from "mongodb";
import jwt from 'jsonwebtoken'
import { settings } from "../settings";



export const jwtService = {
    async createJWT(user: GetUserType) {
        const token = jwt.sign({userId: user.id}, settings.JWT_SECRET, {expiresIn: "10s"})
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
    async createRefreshToken(user: GetUserType) {
        const Refreshtoken = jwt.sign({userId: user.id}, settings.Refresh_Secret, {expiresIn: "20s"})
        return Refreshtoken
    },
    async getUserIdByToken(token: string) {
        try {
            const result: any = jwt.verify(token, settings.Refresh_Secret)
            return new ObjectId(result.userId)
        } catch(error) {
            return null
        }
    }
}  