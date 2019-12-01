import * as Yup from 'yup';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6) // password obrigatorio de oldPassword for informado
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });
    await schema.validate(req.body, { abortEarly: false });

    return next();
  } catch (err) {
    console.log('entrou aqui');
    return res.status(400).json({
      error: 'Validation fails!',
      messages: err.inner, // .map(i => i.message),
    });
  }
};
