import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

export const isAuth = (request, response, next) => {
  const authorization = request.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.lenght); // Removing 'Bearer '
    jwt.verify(token, process.env.JWT_SECRET, (error, decodeString) => {
      if (error) {
        response.status(401).send({ message: "Invalid Token" });
      } else {
        request.user = decodeString;
        next();
      }
    });
  } else {
    response.status(401).send({ message: "Invalid Token" });
  }
};
