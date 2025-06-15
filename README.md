# Next Auth Kit

A clean, reliable starting point for integrating Next.js authentication with Prisma. This kit eliminates the complexity and common pitfalls when combining `next-auth` with `prisma`, providing developers with a streamlined setup for rapid development.

## ✨ Features

- **🚀 Fast Integration** - Streamlined setup process for rapid development
- **🔧 Dependency Free** - Eliminates common integration headaches
- **🛡️ Prisma Ready** - Seamless database integration included
- **⭐ Production Ready** - Battle-tested and reliable foundation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-github-username/next-auth-kit.git
   cd next-auth-kit
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   DATABASE_URL="your-database-connection-string"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🛠️ Tech Stack

- **Framework** - Next.js 14+
- **Authentication** - NextAuth.js
- **Database** - Prisma ORM
- **Styling** - Tailwind CSS
- **Language** - TypeScript

## 📝 Configuration

### Database Setup

This kit supports multiple database providers. Update your `schema.prisma` file according to your preferred database:

```prisma
// For PostgreSQL
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// For MySQL
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// For SQLite (development)
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### Authentication Providers

Configure your authentication providers in `pages/api/auth/[...nextauth].js` or add new ones as needed.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⭐ Support

If this project helped you, please consider giving it a star on GitHub!

---

**Built with ❤️ by [Niraj Jha](https://github.com/your-github-username)**
