declare namespace NodeJS {
  interface ProcessEnv {
    DOMAIN: string;
    PORT: string;

    DISCORD_CLIENT_ID: string;
    DISCORD_CLIENT_SECRET: string;

    DATABASE_CONNECTION: string;

    JWT_SECRET: string;
  }
}
