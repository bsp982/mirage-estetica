import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite acessar o dev server por 127.0.0.1 (além de localhost).
  // Sem isso, o client JS pode não hidratar e os botões do wizard ficam inertes.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
