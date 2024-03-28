npx tsc
esbuild ./dist/client/client.js --bundle --outfile=./dist/client/client.js --allow-overwrite
for dir in `find src -type d`; do mkdir -p "dist${dir#src}"; done
for dir in `find src -type d`; do for file in `find "${dir}" -maxdepth 1 -type f ! -name "*.ts"`; do cp "$file" "./dist/${file#src/}"; done; done