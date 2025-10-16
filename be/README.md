1. npm install
2. .env
    DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
    JWT_SECRET="ganti_dengan_secret_yang_kuat"
    PORT=3000
3. npx prisma migrate dev --name init
4. npm run dev
