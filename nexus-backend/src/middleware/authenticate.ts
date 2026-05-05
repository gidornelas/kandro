import type { FastifyReply, FastifyRequest } from "fastify";
import { UnauthorizedError } from "../lib/errors.js";

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Token não fornecido");
  }

  const token = authHeader.slice(7);
  try {
    const payload = request.server.jwtVerify(token);
    request.user = payload;
  } catch {
    throw new UnauthorizedError("Token inválido ou expirado");
  }
}
