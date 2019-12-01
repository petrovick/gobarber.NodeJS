import * as Yup from 'yup';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

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
