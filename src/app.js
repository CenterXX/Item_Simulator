// src/app.js
require("dotenv").config();
const express = require("express");
const app = express();
const prisma = require("./prismaClient"); // Prisma 클라이언트 사용
const authRoutes = require("./routes/authRoutes"); // 사용자 인증 경로
const characterRoutes = require("./routes/characterRoutes"); // 캐릭터 관련 경로
const itemRoutes = require("./routes/itemRoutes"); // 아이템 관련 경로

app.use(express.json()); // JSON 파싱 미들웨어

// 경로 설정
app.use("/api/auth", authRoutes);
app.use("/api/characters", characterRoutes);
app.use("/api/items", itemRoutes);

// 기본 경로
app.get("/", (req, res) => {
  res.send("Welcome to the Item Simulator API");
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
