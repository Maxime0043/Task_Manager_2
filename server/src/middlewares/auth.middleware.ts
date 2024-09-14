import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import User from "../db/models/user";

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

export async function adminRequired(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.session.token) {
    // Retrieve the user
    const user = await User.findByPk(res.locals.userId);

    if (user && user.isAdmin) {
      next();
    } else {
      return res.sendStatus(401);
    }
  } else {
    return res.sendStatus(401);
  }
}
