import { FastifyReply, FastifyRequest } from 'fastify';

export async function sessionIdMiddleware(
  request: FastifyRequest,
  response: FastifyReply
) {
  const sessionId = request.cookies.sessionId;

  if (!sessionId) {
    return response
      .status(401)
      .send({ message: 'Tried to access unauthorized resource' });
  }
}
