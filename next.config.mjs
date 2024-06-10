// next.config.mjs
export default {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "openweathermap.org"
            }
        ]
    }
}
