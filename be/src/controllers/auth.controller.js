import { prisma, Role } from "../configs/prisma.js";
import bcrypt from "bcryptjs";
import { signPayLoad, verifyToken } from "../utils/jwt.js";

const CGetRole = (email) => {
  if (email.endsWith("@student")) return Role.Mahasiswa;
  if (email.endsWith("@dosen")) return Role.Dosen;
  if (email.endsWith("@tendik")) return Role.Tendik;
  return Role.Guest; // jika domain tidak dikenal
};

const getUsername = (email) => {
  return email.split("@")[0]; // ambil bagian sebelum "@"
};

// 🔹 Registrasi user baru
export const CRegister = async (req, res) => {
  const { email, password, fullName } = req.body;

  if (!email || !password || !fullName) return res.status(400).json({ message: "Email, password, nama lengkap wajib diisi" });

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) return res.status(400).json({ message: "Email sudah terdaftar" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const username = getUsername(email);
  const role = CGetRole(email); // otomatis tentukan role

  const newUser = await prisma.user.create({
    data: { fullName, email, username, password: hashedPassword, role },
  });

  res.status(201).json({
    message: "Registrasi berhasil",
    user: {
      fullName: newUser.fullName,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    },
  });
};

// 🔹 Login user
export const CLogin = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Password salah" });

  const token = signPayLoad(
    {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    "8h"
  );

  res.json({
    message: "Login berhasil",
    token,
    fullName: user.fullName,
    username: user.username,
    role: user.role,
  });
};

// 🔹 Ambil data user dari token (misalnya untuk halaman profil atau greeting)
export const CMe = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token tidak ditemukan" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    res.json({ message: `Hi, ${decoded.role}!`, user: decoded });
  } catch (err) {
    res.status(401).json({ message: "Token tidak valid" });
  }
};

// daftar dosen (hanya oleh Tendik)
export const CListDosen = async (req, res) => {
  try {
    const dosens = await prisma.user.findMany({ where: { role: Role.Dosen }, select: { id: true, fullName: true, email: true, username: true, role: true } });
    res.json({ data: dosens });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data dosen" });
  }
};

// daftar mahasiswa (oleh Tendik dan Dosen)
export const CListMahasiswa = async (req, res) => {
  try {
    const mhs = await prisma.user.findMany({ where: { role: Role.Mahasiswa }, select: { id: true, fullName: true, email: true, username: true, role: true } });
    res.json({ data: mhs });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data mahasiswa" });
  }
};
