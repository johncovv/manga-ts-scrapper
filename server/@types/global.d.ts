declare global {
	namespace NodeJS {
		interface ProcessEnv {
			PORT?: string;
			BASE_URL: string;
		}
	}
	interface Window {
		baseUrl: string;
		mangaId: string;
		chapter: string;
		searched: string;
	}
	interface ErrorResponseType {
		status: number;
		err: string;
		requested?: unknown;
	}
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
