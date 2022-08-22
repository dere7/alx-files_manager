import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

async function getConnect(req, res) {
  const auth = req.headers.authorization.split(' ')[1];
  const buf = Buffer.from(auth, 'base64');
  const [email, password] = buf.toString('ascii').split(':');
  const user = await dbClient.getUserByEmail(email);
  if (user && sha1(password) === user.password) {
    const token = uuidv4();
    await redisClient.set(`auth_${token}`, user._id.toString(), 24 * 60 * 60);
    res.status(200).json({ token });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

async function getDisconnect(req, res) {
  const token = `auth_${req.headers['x-token']}`;
  const userId = await redisClient.get(token);
  if (userId) {
    await redisClient.del(token);
    res.status(204).end();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

export default {
  getConnect,
  getDisconnect,
};
