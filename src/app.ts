import "reflect-metadata";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { json, text, urlencoded } from "body-parser";
import indexRoutes from "./routes";
import ErrorHandler from "./middleware/errorHandler";
import helmet from "helmet";
import compression from "compression";
import db from "./models/database";
import { requestLogger } from "./middleware/requestLogger";
import { logger } from "./utils/logger/logger";
import { serverAdapter } from "./utils/handler/bullBoard";

const app = express();

app.set("etag", false);

app.use(json());
app.use(text());
app.use(urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "*",
    credentials: false,
  }),
);

app.use(compression()); // Compress all routes responses

app.use(helmet()); // Set security headers

// Setup Route for queue board
serverAdapter.setBasePath("/admin/queues");

// Register the routers
app.use("/admin/queues", serverAdapter.getRouter());
app.get("/", (request: Request, response: Response) => {
  response.redirect("/v1");
});
app.use(requestLogger);
app.use("/v1", indexRoutes);

app.use(ErrorHandler);
//add a logo with name favicon.ico to public folder and uncomment the line below to serve favicon
// app.use(serveFavicon(path.join(__dirname, "../public", "favicon.ico")));

// Initialize the database connection
db.connect().catch((error) =>
  logger.error("Error Initializing Database Connection:", error),
);

export default app;
