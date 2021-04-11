import { NextFunction, Request, Response } from "express";

export const myCors = (req: Request, res: Response, next: NextFunction) => {
  res.header("Acces-Control-Allow-Origin", "*");
  res.header(
    "Acces-Control-Allow-hHeaders",
    "Origin, X-Request-With, Content-Type, Accept"
  );
  next();
};
