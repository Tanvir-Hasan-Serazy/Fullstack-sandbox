import { prisma } from "../prisma/client.js";
import { hashSync, compareSync } from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets.js";

export const signup = async (req, res) => {
  const { firstName, lastName, age, email, phone, address, password } =
    req.body;

  let user = await prisma.user.findFirst({ where: { email: email } });

  if (user) {
    throw Error("User Already Exist");
  }

  user = await prisma.user.create({
    data: {
      firstName: firstName,
      lastName: lastName,
      age: age,
      email: email,
      phone: phone,
      address: address,
      password: hashSync(password, 10),
    },
  });

  res.json(user);
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  let user = await prisma.user.findFirst({ where: { email: email } });
  if (!user) {
    throw Error("User doesnt exist");
  }

  if (!compareSync(password, user.password)) {
    throw Error("Incorrect password");
  }

  const token = jwt.sign(
    {
      userId: user.id,
    },
    JWT_SECRET
  );
  res.json({ user, token });
};
