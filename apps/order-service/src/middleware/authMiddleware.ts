import { FastifyReply, FastifyRequest } from "fastify";
import { getAuth } from "@clerk/fastify";
import type { CustomJwtSessionClaims } from "@repo/types";

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
  }
}

export const shouldBeUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { userId } = getAuth(request);
  if (!userId) {
    return reply.status(401).send({ message: "You are not logged in!" });
  }

  request.userId = userId;
};

export const shouldBeAdmin = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const auth = getAuth(request);
  if (!auth.userId) {
    return reply.status(401).send({ message: "You are not logged in!" });
  }

  const claims = auth.sessionClaims as CustomJwtSessionClaims;

  // Check for admin role (organization role first, then user metadata as fallback)
  const orgRole = (claims as any).o?.rol;
  const userMetadataRole = (claims as any).metadata?.role;

  const isAdmin = orgRole === "admin" || userMetadataRole === "admin";

  if (!isAdmin) {
    return reply.status(403).send({ message: "Unauthorized! Admin role required." });
  }

  request.userId = auth.userId;
};
