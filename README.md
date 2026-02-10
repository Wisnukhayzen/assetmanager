# Satup App - Mobile-First Asset Management System

Aplikasi manajemen aset berbasis web dengan pendekatan mobile-first, dibangun menggunakan Vue 3, Shadcn-vue, dan Supabase.

## 🚀 Fitur Utama

- ✅ **Mobile-First Design** - Responsif dengan bottom navigation (mobile) dan sidebar (desktop)
- ✅ **Role-Based Access Control** - Admin dan Operator dengan hak akses berbeda
- ✅ **Manajemen Ruangan** - Kelola ruangan dengan foto header
- ✅ **Manajemen Aset** - Tracking aset lengkap dengan kondisi (Baik, Rusak Ringan, Rusak Berat)
- ✅ **Upload Gambar** - Kompresi otomatis dan penyimpanan Base64
- ✅ **Dashboard Statistik** - Overview kondisi aset secara real-time
- ✅ **Search & Filter** - Cari dan filter aset berdasarkan kondisi

## 🛠️ Tech Stack

- **Frontend**: Vue 3 (Composition API) + TypeScript
- **Build Tool**: Vite
- **UI Library**: Shadcn-vue (Tailwind CSS + Radix Vue)
- **State Management**: Pinia
- **Backend/Database**: Supabase (PostgreSQL)
- **Icons**: Lucide Vue Next
- **Image Compression**: browser-image-compression

## 📋 Prerequisites

- Node.js >= 20.19.0 atau >= 22.12.0
- Akun Supabase (gratis di [supabase.com](https://supabase.com))

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Buat project baru di [Supabase Dashboard](https://app.supabase.com)
2. Salin **Project URL** dan **Anon Key** dari Settings > API
3. Update file `.env` dengan credentials Anda:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Setup Database

1. Buka Supabase SQL Editor
2. Jalankan script dari `supabase/schema.sql` untuk membuat tabel
3. Jalankan script dari `supabase/rls-policies.sql` untuk mengaktifkan Row Level Security

### 4. Create Admin User

Karena menggunakan Supabase Auth, Anda perlu membuat user pertama:

1. Di Supabase Dashboard, buka **Authentication** > **Users**
2. Klik **Add User** dan buat user dengan email/password
3. Salin User ID yang baru dibuat
4. Di SQL Editor, jalankan query berikut (ganti `USER_ID` dan data lainnya):

```sql
INSERT INTO users (id, name, email, role)
VALUES (
  'USER_ID_FROM_AUTH',
  'Admin Name',
  'admin@example.com',
  'admin'
);
```

### 5. Run Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## 📱 Mobile Testing

Untuk testing di mobile device:

1. Pastikan device dan komputer dalam jaringan yang sama
2. Jalankan dev server dengan host flag:

```bash
npm run dev -- --host
```

3. Akses menggunakan IP address yang ditampilkan di terminal

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/              # Shadcn-vue base components
│   ├── layout/          # Layout components (Sidebar, BottomNav)
│   ├── Base64Upload.vue # Image upload component
│   └── ConditionBadge.vue
├── composables/
│   └── useImageHandler.ts
├── lib/
│   ├── supabase.ts      # Supabase client
│   └── utils.ts         # Utility functions
├── stores/
│   ├── auth.ts          # Authentication store
│   ├── ruangan.ts       # Room management store
│   └── asset.ts         # Asset management store
├── types/
│   └── database.ts      # TypeScript types
├── views/
│   ├── LoginView.vue
│   ├── DashboardView.vue
│   ├── RoomListView.vue
│   └── AssetListView.vue
└── router/
    └── index.ts         # Vue Router configuration
```

## 👥 User Roles

### Admin
- Akses penuh ke semua ruangan dan aset
- Dapat menambah/edit/hapus ruangan
- Dapat mengelola user operator
- Melihat statistik sistem secara keseluruhan

### Operator
- Hanya dapat mengakses ruangan yang ditugaskan
- Dapat mengelola aset di ruangan yang ditugaskan
- Melihat statistik ruangan yang ditugaskan

## 🔒 Security

- Row Level Security (RLS) diaktifkan di semua tabel
- Operator hanya dapat mengakses data yang ditugaskan
- Admin memiliki akses penuh dengan policy khusus
- Password di-hash menggunakan Supabase Auth

## 🎨 Design Features

- **Mobile-First**: Bottom navigation untuk mobile, sidebar untuk desktop
- **Touch-Friendly**: Minimum 44px touch targets di mobile
- **Responsive Images**: Aspect ratio terjaga dengan kompresi otomatis
- **Color-Coded Status**: Badge berwarna untuk kondisi aset
- **Smooth Transitions**: Animasi halus untuk UX yang lebih baik

## 📝 Development Commands

```bash
# Development
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint

# Format code
npm run format
```

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Pastikan file `.env` sudah dibuat dan berisi credentials yang benar
- Restart dev server setelah mengubah `.env`

### "Cannot find module" errors
- Jalankan `npm install` untuk memastikan semua dependencies terinstall
- Restart TypeScript server di VS Code

### RLS Policy errors
- Pastikan semua policy dari `supabase/rls-policies.sql` sudah dijalankan
- Cek di Supabase Dashboard > Authentication bahwa RLS enabled

## 📄 License

MIT

## 👨‍💻 Author

Built with ❤️ using Vue 3 and Supabase
