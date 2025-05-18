declare namespace NodeJS {
	export interface ProcessEnv {
		DATABASE_URL: string;
		CLIENT_URL: string;
		ACCESS_TOKEN_SECRET: string;
		REFRESH_TOKEN_SECRET: string;
		API_PORT: string;
	}
}
