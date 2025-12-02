import { Server } from "http";
import config from "./config";
import app from "./app";
import { seedAdmin } from "./app/seed/admin.seed";

async function bootstrap() {
  let server: Server;

  try {
    // Seed Admin Before Server Starts
    await seedAdmin();

    server = app.listen(config.port, () => {
      console.log(`🚀 Server is running on http://localhost:${config.port}`);
    });

    const exitHandler = () => {
      if (server) {
        server.close(() => {
          console.log("Server closed gracefully.");
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    };

    process.on("unhandledRejection", (error) => {
      console.log("Unhandled Rejection detected, closing server...");
      if (server) {
        server.close(() => {
          console.log(error);
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("Error during server startup:", error);
    process.exit(1);
  }
}

bootstrap();
