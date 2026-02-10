export type UserRole = 'admin' | 'operator'
export type AssetKondisi = 'baik' | 'rusak_ringan' | 'rusak_berat'

export interface User {
  id: string
  name: string
  email: string
  profile_picture?: string | null
  sampul_img?: string | null
  role: UserRole
  created_at?: string
  updated_at?: string
}

export interface Ruangan {
  id: number
  user_id: string
  name: string
  header_img?: string | null
  created_at?: string
  updated_at?: string
  user?: {
    name: string
    role: UserRole
    profile_picture?: string | null
  }
}

export interface Asset {
  id: string
  ruangan_id: number
  name: string
  merk?: string | null
  tahun?: number | null
  kode?: string | null
  nup?: string | null
  milik?: string | null
  jumlah: number
  kondisi: AssetKondisi
  foto?: string | null
  created_at?: string
  updated_at?: string
}

export interface AssetWithRuangan extends Asset {
  ruangan?: Ruangan
}

export interface DashboardStats {
  totalAssets: number
  baik: number
  rusakRingan: number
  rusakBerat: number
}
