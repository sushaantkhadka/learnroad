import jwt from "jsonwebtoken";

const generateToken = (userId, res) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  res.cookie("access_token", token, {
    httpOnly: true,
    maxAge: 15 * 24 * 60* 60* 1000
  });
};

export default generateToken;
