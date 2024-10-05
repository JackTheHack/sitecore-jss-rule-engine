/** @type {import('next').NextConfig} */

const nextConfig = {
    experimental: { // [!code ++]
      serverComponentsExternalPackages: ['grammy'], // [!code ++]
    }, // [!code ++]
}

export default nextConfig;
