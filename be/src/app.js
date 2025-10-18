import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import axios from "axios";
import { URLSearchParams } from "url";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = 5000;
const KEYCLOAK_URL = process.env.KEYCLOAK_REALM_URL;
const REDIRECT_URI = "http://localhost:5000/callback";
const CLIENT_ID = "ets-backend-client-test";
const CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET;

app.use(
  cors({
    origin: "http://localhost:5500",
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// ------------------------------------------------------------------
// 1. ENDPOINT LOGIN (Mengarahkan ke Keycloak)
// ------------------------------------------------------------------
app.get("/login", (req, res) => {
  const authUrl =
    `${KEYCLOAK_URL}/protocol/openid-connect/auth` +
    `?client_id=${CLIENT_ID}` +
    `&redirect_uri=${REDIRECT_URI}` +
    `&response_type=code` +
    `&scope=openid profile email`;

  res.redirect(authUrl);
});

// ------------------------------------------------------------------
// 2. ENDPOINT CALLBACK (SIMPLE - tanpa assign role)
// ------------------------------------------------------------------
app.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Login gagal: Code tidak ditemukan.");
  }

  try {
    // Tukar code dengan token
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("client_id", CLIENT_ID);
    params.append("client_secret", CLIENT_SECRET);
    params.append("redirect_uri", REDIRECT_URI);
    params.append("code", code);

    const tokenResponse = await axios.post(
      `${KEYCLOAK_URL}/protocol/openid-connect/token`,
      params
    );

    const { access_token } = tokenResponse.data;

    // Decode token untuk mendapatkan role
    const jwtPayload = JSON.parse(
      Buffer.from(access_token.split(".")[1], "base64").toString()
    );

    const roles = jwtPayload.realm_access?.roles || [];
    const userEmail = jwtPayload.email;
    const username = jwtPayload.preferred_username;

    // 🔥 LANGSUNG REDIRECT KE FRONTEND DENGAN ROLE DARI KEYCLOAK
    const frontendUrl =
      `http://localhost:5500/fe/dashboard.html?` +
      `email=${encodeURIComponent(userEmail)}&` +
      `username=${encodeURIComponent(username)}&` +
      `roles=${encodeURIComponent(JSON.stringify(roles))}&` +
      `token=${encodeURIComponent(access_token)}`;

    res.redirect(frontendUrl);
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    res.redirect("http://localhost:5500/error.html?message=Login failed");
  }
});

// ------------------------------------------------------------------
// 3. LOGOUT
// ------------------------------------------------------------------
app.get("/logout", (req, res) => {
  const logoutUrl =
    `${KEYCLOAK_URL}/protocol/openid-connect/logout` +
    `?redirect_uri=http://localhost:5500`;

  res.redirect(logoutUrl);
});

// ------------------------------------------------------------------
// 4. MAIN API ROUTES
// ------------------------------------------------------------------
app.use("/api/v1", authRoutes);

// ------------------------------------------------------------------
// 5. ROOT ENDPOINT (TEST)
// ------------------------------------------------------------------
app.get("/", (req, res) => {
  res.send(`
    <h1>🚀 Backend ETS System</h1>
    <p>Backend berjalan di port ${PORT}</p>
    <a href="/login">Test Login</a>
    <hr>
    <h3>Test Users (pastikan sudah ada di Keycloak):</h3>
    <ul>
      <li>test@student.university.ac.id (role: student)</li>
      <li>test@dosen.university.ac.id (role: dosen)</li>
      <li>test@tendik.university.ac.id (role: tendik)</li>
    </ul>
  `);
});

// Server Listener
app.listen(PORT, () => {
  console.log(`✅ Backend berjalan di http://localhost:${PORT}`);
  console.log(`🔑 Test login: http://localhost:${PORT}/login`);
});
