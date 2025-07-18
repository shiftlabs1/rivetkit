import { defineConfig } from "vitest/config";
import defaultConfig from "../../../vitest.base.ts";

export default defineConfig({
	...defaultConfig,
	test: {
		...defaultConfig.test,
		// Requires time for downloading container
		testTimeout: 60_000,
	},
});
