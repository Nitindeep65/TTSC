/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000"

    return [
      {
        source: "/api/clarification/:path*",
        destination: `${backendUrl}/api/clarification/:path*`,
      },
      {
        source: "/api/database/:path*",
        destination: `${backendUrl}/api/database/:path*`,
      },
      {
        source: "/api/semantic/:path*",
        destination: `${backendUrl}/api/semantic/:path*`,
      },
      {
        source: "/api/memory/:path*",
        destination: `${backendUrl}/api/memory/:path*`,
      },
      {
        source: "/api/settings/:path*",
        destination: `${backendUrl}/api/settings/:path*`,
      },
    ]
  },
}

export default nextConfig
