import { FastifyReply } from "fastify";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} não encontrado(a)`, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Não autorizado") {
    super(401, message, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Acesso negado") {
    super(403, message, "FORBIDDEN");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, "CONFLICT");
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, "VALIDATION_ERROR");
  }
}

export function handleAppError(error: unknown, reply: FastifyReply) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.code || "APP_ERROR",
      message: error.message,
      statusCode: error.statusCode,
    });
  }

  console.error("Unhandled error:", error);
  return reply.status(500).send({
    error: "INTERNAL_ERROR",
    message: "Erro interno do servidor",
    statusCode: 500,
  });
}
