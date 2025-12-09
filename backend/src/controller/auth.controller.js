import { prisma } from "../prisma/client.js";
import { hashSync, compareSync } from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets.js";

export const signup = async (req, res) => {
  const { firstName, lastName, age, email, phone, address, password } =
    req.body;

  let user = await prisma.user.findUnique({ where: { email: email } });

  try {
    if (user) {
      return res.status(409).json({
        error: "User already exist",
      });
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

    return res.status(201).json({
      message: "User created",
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await prisma.user.findUnique({ where: { email: email } });
    if (!user) {
      return res.status(404).json({
        error: "User doesn't exist",
      });
    }

    const isPasswordValid = compareSync(password, user.password);

    if (!isPasswordValid) {
      return req.status(401).json({ error: "Incorrect password" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
      },
      JWT_SECRET
    );

    return res.status(200).json({
      message: "Login Successfully",
      user: {
        email: user.email,
      },
      accessToken: token,
    });
  } catch (error) {
    res.status(401).json({
      error: "Invalid credentials",
    });
  }
};
