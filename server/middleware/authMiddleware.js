const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('❌ JWT_SECRET is not set in environment variables');
}

// ✅ Middleware ตรวจ access token
exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  // console.warn('🔍 Auth header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Token missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Token missing' });
  }
  // console.log('🔑 Verifying token:', token);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // console.log('✅ Token verified:', decoded);

    req.user = decoded; // แนบข้อมูล user ไปใน req
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized: Token invalid or expired' });
  }
};

// ✅ Middleware ตรวจ role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission' });
    }
    next();
  };
};
