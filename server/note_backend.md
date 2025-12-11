
npm init -y
- Buat .gitignore dan diisi `node_modules`

- Install package yang dibutuhkan
    - npm i express pg sequelize bcryptjs jsonwebtoken
    - npm i --save-dev jest supertest

- Dev dependecies
    - npm i -D nodemon sequelize-cli

- npx sequelize-cli init
    - Ini akan membuat 4 folder:
        - config (config.json)
        - migrations (kosong)
        - models (index.js)
        - seeders (kosong)

Atur config.json

  "development": {
    "username": "postgres",            // <-- username postgres
    "password": "postgres",            // <-- password postgres
    "database": "database_branded",    // <-- nama database/ tambahkan _test untuk melakukan testing di bagian "test"
    "host": "127.0.0.1",               // <-- Antara 127.0.0.1 atau localhost
    "dialect": "postgres"              // <-- postgres karena kita pakai postgres
  }

bagian package.json "test"                  // <-- npx jest --verbose --detectOpenHandles --forceExit --runInBand --silent


Setelah atur config.json bisa buat database dengan command:
    - npx sequelize-cli db:create


Cara membuat model
- npx sequelize-cli model:create --name User --attributes full_name:string,email:string,password:string,profile_photo:string

- npx sequelize-cli model:create --name Favorite --attributes user_id:integer,article_id:string,title:string,description:text,content:text,url:string,image_url:string,published_at:date,lang:string,source_id:string,source_name:string,source_url:string,source_country:string




Untuk menjalankan semua migration yang belum dijalankan:
  - npx sequelize-cli db:migrate

Run migration and seed
  - npx sequelize-cli db:migrate --env production
  - npx sequelize-cli db:seed:all --env production


Untuk undo migration yang sudah dijalankan:
  - npx sequelize-cli db:migrate:undo:all

Jalanin seeding pakai command:
  - npx sequelize-cli db:seed:all


Seeding
  - npx sequelize-cli seed:create --name seed-User
  - npx sequelize-cli seed:create --name seed-Category
  - npx sequelize-cli seed:create --name seed-Product
  - npx sequelize-cli seed:create --name data

untuk commit 
 - git add .
 - git commit -m "feat: IP redux"
 - git push origin development

 baru 2 commit
