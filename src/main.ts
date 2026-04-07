import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "@/src/app.module";
import * as dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import cookieParser from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';
import helmet from 'helmet';


dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', true);

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Swagger UI needs 'unsafe-inline' to function correctly
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "validator.swagger.io"], // Allow Swagger images
        connectSrc: ["'self'"], 
      },
    },
    // This policy can block Swagger assets, so we disable it for now
    crossOriginEmbedderPolicy: false,
  }));

  // 1. Logger
  app.use((req: Request, res: Response, next: NextFunction) => {
    const now = new Date().toISOString().replace("T", " ").replace(/\..+/, "");
    console.log(`[HTTP] [${now}] ${req.method} ${req.originalUrl}`);
    next();
  });

  // 2. Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle("KDex API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  // 3. Cookie Parser
  const cookieSecret = process.env.COOKIE_SECRET || 'fallback-secret-dont-use-in-prod';
  app.use(cookieParser(cookieSecret));

  const csrfCookieName = process.env.NODE_ENV === 'production' 
    ? '__Host-psifi.x-csrf-token' 
    : 'psifi.x-csrf-token';

  // 4. Configure CSRF-CSRF
  const {
    doubleCsrfProtection,
    generateCsrfToken,
  } = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET || 'complex-32-char-secret',
    cookieName: csrfCookieName,
    cookieOptions: {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    },
    size: 64,
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    getCsrfTokenFromRequest: (req: Request) => req.headers['x-csrf-token'],
    getSessionIdentifier: (req: Request) => "stateless-session", 
  }) as any; 

  // 5. Apply CSRF Protection Globally
  app.use(doubleCsrfProtection);

  // 6. Expose the Token to Frontend
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET') {
      const token = generateCsrfToken(req, res);
      
      res.cookie('X-CSRF-TOKEN', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
    }
    next();
  });

  // 7. CORS Configuration
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : [];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    maxAge: 86400,
  });

  await app.listen(parseInt(process.env.PORT as string));
}
bootstrap();