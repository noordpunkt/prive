import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image uploads are now handled client-side directly to Supabase Storage
  // No need for serverActions bodySizeLimit
};

export default nextConfig;
