const REQUIRED_ENV_VARS = [
	"ACCESS_TOKEN_SECRET",
	"REFRESH_TOKEN_SECRET",
	"DATABASE_URL",
	"CLIENT_URL",
	"API_PORT",
	"SUPABASE_URL",
	"SUPABASE_SERVICE_ROLE_KEY",
] as const;

export const validateEnv = () => {
	const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
	if (missing.length > 0) {
		throw new Error(
			`Missing required environment variables: ${missing.join(", ")}`,
		);
	}
};
