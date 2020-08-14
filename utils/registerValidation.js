const Joi = require('@hapi/joi');

const registerSchema = Joi.object({
  name: Joi.string().min(1),
  username: Joi.string()
    .alphanum()
    .min(5)
    .max(16)
    .required(),
  email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
  baseCurrency: Joi.string().min(3).max(3).required(),
  password: Joi.string()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})")).required(),
  confirmPassword: Joi.ref('password'),
});

const updateSchema = Joi.object({

})

module.exports = registerSchema