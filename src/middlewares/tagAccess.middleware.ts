import { ForbiddenException, Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Users } from "src/users/schemas/users.schema";

@Injectable()
export class TagAccessMiddleware implements NestMiddleware {
    constructor(@InjectModel(Users.name) private readonly userModel : Model<Users>) {}
    async use(req: Request, res: Response, next: (error?: any) => void) {
       if (req.method === "GET" && req['params'].id || req.method === "DELETE" && req['params'].id) {
        const tagId = req['params'].id;
        const user = await this.userModel.findOne({username: req['user'].username});
        const isAvailable = user.tags.includes(tagId)
        req['user'] = user;
        if (isAvailable) {
            next()
        } else {
            throw new ForbiddenException()
        }
       } else if (req.method === "GET" && !req['params'].id) {
        const user = await this.userModel.findOne({username: req['user'].username});
            req['user'] = user; 
            next()
       } else if (req.method === "PUT" || req.method === "POST") {
            const user = await this.userModel.findOne({username: req['user'].username});
            req['user'] = user;
            if (req.body['id']) {
                const tagId = req.body['id'];
                const isAvailable = user.tags.includes(tagId);
                if (isAvailable) {
                    next()
                } else {
                    throw new ForbiddenException()
                }
            } else {
                next()
            }
       }
    }
}