// const jwt = require('jsonwebtoken');

// function verifyToken(req, res, next) {

//   const token = req.cookies.token;
//   if (!token) return res.status(401).json({ error: 'Unauthorized' });
// const decoded = jwt.verify(token, process.env.JWT_SECRET);
// req.user = decoded;
//   if (!token) return res.sendStatus(401);
//   try {
//    const decoded = jwt.verify(token, process.env.JWT_SECRET);
// console.log('Decoded user:', decoded);
// console.log('Cookies:', req.cookies);
// console.log('Token:', req.cookies.token);


//     req.user = decoded;
//     next();
//   } catch {
//     res.sendStatus(403);
//   }
// }

// module.exports = { verifyToken };





// const jwt = require('jsonwebtoken');

// const authMiddleware = (req, res, next) => {
//   const token = req.cookies.token;
// console.log(req.user)
//   if (!token) return res.status(401).json({ error: 'No token provided' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(403).json({ error: 'Invalid or expired token' });
//   }
// };

// module.exports = authMiddleware;



const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded token", decoded);

    if (!decoded.email) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    req.user = decoded;
    next(); // ✅ Only one next() call
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;



