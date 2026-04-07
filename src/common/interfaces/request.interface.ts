import { Request } from "express";

export interface IRequest extends Request {
  request_id?: string;
  start_at: number;
}
