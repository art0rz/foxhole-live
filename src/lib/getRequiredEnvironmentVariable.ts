import process from 'process';

function getRequiredEnvironmentVariable(name: string): string {
	if (!process.env[name]) {
		throw new Error(`Environment variable ${name} not set. Exiting`);
	}

	return process.env[name] as string;
}

export default getRequiredEnvironmentVariable;
