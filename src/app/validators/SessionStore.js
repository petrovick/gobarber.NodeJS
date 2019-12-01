import * as Yup from 'yup';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      email: Yup.string().email(),
      password: Yup.string().required(),
    });

    console.log('Chegu');

    await schema.validate(req.body, { abortEarly: false });

    console.log('passou');
    return next();
  } catch (err) {
    console.log('entrou aqui');
    return res
      .status(400)
      .json({ error: 'Validation fails!', messages: err.inner });
  }
};
