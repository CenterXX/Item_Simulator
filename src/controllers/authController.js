import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js';

// 회원가입 API
export const signup = async (req, res) => {
  const { username, password } = req.body;

  // 비밀번호 해시 처리
  const hashedPassword = await bcrypt.hash(password, 10);

  // 새로운 유저 생성
  const newUser = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
    },
  });

  // 유저 생성 성공 시 반환할 정보
  res.status(201).json({ id: newUser.id, username: newUser.username });
};

// 로그인 API
export const login = async (req, res) => {
  const { username, password } = req.body;

  // 데이터베이스에서 유저 찾기
  const user = await prisma.user.findUnique({ where: { username } });

  // 유저가 존재하지 않거나 비밀번호가 일치하지 않는 경우
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: '유효하지 않은 자격 증명입니다.' });
  }

  // 유저가 존재하고 비밀번호가 일치하는 경우 JWT 생성
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  // 생성된 JWT 토큰 반환
  res.json({ token });
};
