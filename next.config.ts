import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
	images: {
		remotePatterns: [{
			protocol: 'https',
			hostname: 'utfs.io',
			port: '',
		}]
	},
	devIndicators: {
		buildActivity: false
	}
	//devIndicators: false
};
	
export default nextConfig;
