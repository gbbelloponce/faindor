declare namespace NodeJS {
	export interface ProcessEnv {
		DATABASE_URL: string;
		CLIENT_URL: string;
		JWT_SECRET: string;
	}
}
