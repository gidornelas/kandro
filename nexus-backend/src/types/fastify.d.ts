import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user: {
      sub: string;
      userId: string;
      email: string;
      name: string;
    };
  }
}
