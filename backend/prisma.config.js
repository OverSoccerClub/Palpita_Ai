// Prisma 7 configuration file
// This file is used by the Prisma CLI for migrations and generation

module.exports = {
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        // DATABASE_URL must be provided at runtime (Easypanel)
        // We provide a fallback for the docker build phase
        url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/palpitai-app",
    },
};
