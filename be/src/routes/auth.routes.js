// File: routes/auth.routes.js
import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { CGetMyProfile, CGetAllMahasiswa, CUpdateRole } from "../controllers/auth.controller.js";

const router = express.Router();

// 1. Endpoint Mahasiswa: Hanya boleh melihat profilnya sendiri
router.get('/profile/me', 
  protect, 
  authorize(['Mahasiswa']), 
  CGetMyProfile
);

// 2. Endpoint Dosen: Melihat semua data mahasiswa
router.get('/mahasiswa/all', 
  protect, 
  authorize(['Dosen']), 
  CGetAllMahasiswa
);

// 3. Endpoint Tendik: Mengubah role pengguna
router.put('/user/role/:userId', 
  protect, 
  authorize(['Tendik']), 
  CUpdateRole
);

export default router;