/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force cache invalidation on deploy - increment to bust cache
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
}

module.exports = nextConfig
