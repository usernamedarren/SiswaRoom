const jwt = require('jsonwebtoken');

function generateToken(user) {
  const payload = { id: user.user_id || user.id, role: user.role };
  return jwt.sign(payload, process.env.JWT_SECRET || 'change_this_secret', {
    expiresIn: '7d',
  });
}

module.exports = generateToken;
