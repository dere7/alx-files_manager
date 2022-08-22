import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

async function postNew(req, res) {
  const { email, password } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Missing email' });
  } else if (!password) {
    res.status(400).json({ error: 'Missing password' });
  } else {
    const user = await dbClient.getUserByEmail(email);
    if (user) {
      res.status(400).json({ error: 'Already exist' });
    } else {
      const hashedPassword = sha1(password);
      const { ops } = await dbClient.addUser(email, hashedPassword);
      const { _id: id } = ops[0];
      res.status(201).json({ id, email });
    }
  }
}

async function getMe(req, res) {
  const token = `auth_${req.headers['x-token']}`;
  const userId = await redisClient.get(token);
  if (userId) {
    const { email, _id: id } = await dbClient.getUser(userId);
    res.json({ id, email });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

export default {
  postNew,
  getMe,
};
