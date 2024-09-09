import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function auth(req: Request, res: Response, next: NextFunction) {
  if (req.session.token) {
    // Decode the token
    try {
      const decoded: any = jwt.verify(
        req.session.token,
        process.env.JWT_PRIVATE_KEY!
      );
      res.locals.userId = decoded.userId;

      next();
    } catch (err: any) {
      req.session.token = "";
      req.session.destroy((err) => {
        next();
      });
    }
  } else {
    next();
  }
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
  if (req.session.token) {
    next();
  } else {
    return res.sendStatus(401);
  }
}
