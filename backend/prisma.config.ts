import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        // Falls back to a dummy URL during docker build to prevent CLI errors
        url: process.env["DATABASE_URL"] || "postgresql://postgres:postgres@localhost:5432/palpitai-app",
    },
});
