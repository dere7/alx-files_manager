import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export async function authenticated(req) {
  const token = `auth_${req.headers['x-token']}`;
  const userId = await redisClient.get(token);
  const user = await dbClient.users.findOne({ _id: ObjectId(userId) });
  if (user) {
    return [token, user];
  }
  return null;
}

export async function isAuthenticated(req) {
  return authenticated(req) !== null;
}

export default async function xTokenAuth(req, res, next) {
  const auth = await authenticated(req);
  if (auth) {
    const [token, user] = auth;
    req.token = token;
    req.userId = user._id;
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
