import { Request, Response, NextFunction } from 'express';
export declare const compressionMiddleware: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const brotliMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const responseSizeMonitor: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=compression.d.ts.map