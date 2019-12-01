import * as Yup from 'yup';
import User from '../models/User';
import File from '../models/File';
import Cache from '../../lib/cache';

class UserController {
  async store(req, res) {
    const userExists = await User.findOne({ where: { email: req.body.email } });
    if (userExists) {
      return res.status(400).json({ error: 'user already exists!' });
    }

    const { id, name, email, provider } = await User.create(req.body);
    if (provider) {
      await cache.invalidate('providers');
    }
    return res.json({
      id,
      name,
      email,
      provider,
    });
  }

  async update(req, res) {
    const { email, oldPassword } = req.body;
    const user = await User.findByPk(req.userId);
    if (email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return res.status(400).json({ error: 'user already exists!' });
      }
    }
    // soh alterar se passar senha antiga(com intesao de mudar a senha)
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match!' });
    }
    console.log('Antes de fazer o update');
    console.log(req.body);
    console.log('Antes de mandar o update');
    await user.update(req.body);

    const { id, name, avatar } = await User.findByPk(req.userId, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json({
      id,
      name,
      email,
      avatar,
    });
  }
}

export default new UserController();
