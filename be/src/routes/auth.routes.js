import { Router } from "express";
import { CRegister, CLogin, CMe, CListDosen, CListMahasiswa } from "../controllers/auth.controller.js";
import { MAuth } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

router.post("/register", CRegister);
router.post("/login", CLogin);
router.get("/me", MAuth, CMe);
// hanya Tendik boleh melihat daftar dosen
router.get("/list/dosen", MAuth, authorizeRoles("Tendik"), CListDosen);
// Tendik dan Dosen boleh melihat daftar mahasiswa
router.get("/list/mahasiswa", MAuth, authorizeRoles("Tendik", "Dosen"), CListMahasiswa);

export default router;
