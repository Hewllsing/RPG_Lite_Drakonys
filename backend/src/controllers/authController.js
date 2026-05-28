const {
  loginUser,
  registerUser
} = require('../services/authService');

async function register(req, res) {

  try {
    const result = await registerUser(req.body);

    res.status(201).json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Erro ao criar utilizador.'
    });
  }
}

async function login(req, res) {

  try {
    const result = await loginUser(req.body);

    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Erro ao fazer login.'
    });
  }
}

module.exports = {
  register,
  login
};
