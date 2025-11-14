const nextConfig = {

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/:path*", // Proxy to our backend
      },
    ];
  },
};

export default nextConfig;
