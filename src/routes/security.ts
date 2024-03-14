import { ObjectId } from "mongodb";
import { jwtService, tokenService } from "../aplication/jwt-service";
import { UserLoginInformation, collection3, collection6 } from "../db";
import {Request, Response, Router} from "express"



export const securityRoutes = Router()

securityRoutes.get('/', async (req: Request, res: Response) => {

    
    const token = req.cookies['refreshToken']

    // const token = req.headers.authorization.split(" ")[1] 

    // const deviceId = await tokenService.getDeviceIdByToken(token)

    // if(deviceId == undefined) {
    //     return res.sendStatus(401);
    // }

    const JWTtoken = await tokenService.getUserIdByToken(token)  

    if(JWTtoken == undefined || null) {
      return res.sendStatus(401);
    }

    const authUser = await (collection6.find<UserLoginInformation>({ userId: JWTtoken as ObjectId })).toArray();

    const modifiedUsers = authUser.map(user => {
      const { _id, userId, ...rest } = user;
      return rest;
    });

    if (authUser.length > 0) {
        return res.status(200).send(modifiedUsers);
    } else {
        return res.sendStatus(401);
    }
  });





  securityRoutes.delete("/:deviceId", async (req: Request, res: Response) => {

    const RefreshToken = req.cookies['refreshToken']

    const userId = await tokenService.getUserIdByToken(RefreshToken)

    if(userId == null ) {
        return res.status(401).send()
    }

    // const deviceId = await tokenService.getDeviceIdByToken(RefreshToken)

    const deviceId = req.params.deviceId
    
    const device1 = await collection6.findOne({deviceId: deviceId as unknown as string});

      if(!device1){
        return res.status(404).send()
      }

    const device = await collection6.findOne({ 
        $and: [
            { deviceId: deviceId as unknown as string },
            { userId: userId }
        ]
    });

    if(!device){
        return res.status(403).send()
    }
    
    if (device) {
      await collection6.deleteOne({ 
        $and: [
            { deviceId: deviceId as unknown as string },
            { userId: userId }
        ]
    });
      return res.status(204).send();
    } else {
      return res.status(404).send()
    }
  
  });



  securityRoutes.delete("/", async (req: Request, res: Response) => {

    const RefreshToken = req.cookies['refreshToken']

    const userId = await tokenService.getUserIdByToken(RefreshToken)

    if(userId == null) {
        return res.status(401).send()
    }

    const deviceId = await tokenService.getDeviceIdByToken(RefreshToken)

    
    const device = await collection6.findOne({ 
        $and: [
            { deviceId: deviceId as unknown as string },
            { userId: userId }
        ]
    });

    if(!device){
        return res.status(404).send()
    }
    
    if (device) {
      await collection6.deleteMany({
        $and: [
            { userId: userId },
            { deviceId: { $ne: deviceId as unknown as string } }
        ]
    }); 
      return res.status(204).send();
    } else {
      return res.status(404).send()
    }
  
  });