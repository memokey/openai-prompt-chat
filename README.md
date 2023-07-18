# Mindgem

## 📝 Requirements

- 🟢 Node.js
- 🧶 Yarn
- 🐳 Docker 
- 🦊 Metamask

## 🔧 Setup

- Duplicate the `.env.example` file and rename it to a `.env` file.

- Run `yarn` to install all dependencies. 📦

- To setup and run the database, execute the following command in the terminal:

`docker compose up`

⚠️ Make sure Docker is running.
- In another terminal window, run:

 `npx prisma db push`

 `npx prisma generate`

This will initialize your database and generate the required Prisma client. 🗂️

## 🧠 Run App

- Run `yarn dev` in your terminal.

- Open your web browser and go to `localhost:3000` to start using Mindgem! 🚀

Enjoy exploring Mindgem! 😄
