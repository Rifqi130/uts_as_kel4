// File: routes/auth.controller.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ROUTE 1: Khusus Mahasiswa (Melihat Profil Sendiri)
export const CGetMyProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
      select: { id: true, email: true, username: true, role: true },
    });

    if (!user) {
      return res
        .status(404)
        .json({ error: "Data pengguna tidak ditemukan di database." });
    }

    res.json({
      status: "success",
      message: "Data profil berhasil diambil.",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil data profil." });
  }
};

// ROUTE 2: Khusus Dosen (Melihat data semua Mahasiswa)
export const CGetAllMahasiswa = async (req, res) => {
  try {
    const mahasiswaList = await prisma.user.findMany({
      where: { role: "Mahasiswa" },
      select: { id: true, email: true, username: true },
    });

    res.json({
      status: "success",
      message: "Daftar semua mahasiswa berhasil diambil.",
      count: mahasiswaList.length,
      data: mahasiswaList,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil daftar mahasiswa." });
  }
};

// ROUTE 3: Khusus Tendik (Mengubah Role User)
export const CUpdateRole = async (req, res) => {
  const { userId } = req.params;
  const { newRole } = req.body;

  if (!["Mahasiswa", "Dosen", "Tendik"].includes(newRole)) {
    return res.status(400).json({ error: "Role yang diberikan tidak valid." });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: { id: true, email: true, role: true },
    });

    res.json({
      status: "success",
      message: `Role user ${updatedUser.id} berhasil diubah menjadi ${newRole}.`,
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengubah role pengguna." });
  }
};
