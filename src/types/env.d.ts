declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /** The API's address for server renders (src/server/api); unset until configured. */
      API_INTERNAL_URL?: string;
      NEXT_PUBLIC_APP_NAME: string;
    }
  }
}

export {};
