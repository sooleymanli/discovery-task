# PlanB Sığorta - Gənc Insanlar üçün Həyat Sığortası Platforması

## 🏢 Biznes Məlumatları

### Məhsul Haqqında
**PlanB Sığorta** - gənc insanlar üçün xüsusi olaraq dizayn edilmiş həyat sığortası platformasıdır. Məhsulun şüarı: **"Plan A ilə risk alırsan, PlanB var!"**

### Biznes Modeli
- **Hədəf Auditoriya**: 18-65 yaş arası gənc insanlar
- **Sığorta Növü**: Həyat sığortası (Life Insurance)
- **Məbləğ Aralığı**: 10,000 - 1,000,000 AZN
- **Müddət**: 5-30 il arası
- **Ödəniş**: Aylıq premium ödənişləri

### Biznes Prosesləri

#### 1. Müştəri Qəbul Prosesi
1. **Landing Page**: Müştərilər əsas səhifədə məhsul haqqında məlumat alır
2. **Kalkulyator**: İnteraktiv kalkulyator ilə premium hesablanması
3. **Müraciət Formu**: Şəxsi və sığorta məlumatlarının doldurulması
4. **Təsdiq**: Müraciət təsdiqlənir və agent təyin edilir

#### 2. Agent İdarəetməsi
- **Agent Qəbulu**: Yeni agentlər dəvət edilir
- **Agent Təyinatı**: Müraciətlər agentlərə təyin edilir
- **Status İdarəetməsi**: Müraciət statusları izlənilir
- **Agent Performansı**: Agent fəaliyyəti monitorinq edilir

#### 3. Admin Panel
- **Dashboard**: Ümumi statistikalar və göstəricilər
- **Müraciət İdarəetməsi**: Bütün müraciətlərin idarə edilməsi
- **Agent İdarəetməsi**: Agent hesablarının idarə edilməsi
- **Kalkulyator Tənzimləməsi**: Premium hesablama qaydalarının tənzimlənməsi
- **Bildiriş Sistemi**: Real-time bildirişlər

#### 4. Kommunikasiya
- **Email Bildirişləri**: Müraciət statusları haqqında email bildirişləri
- **Telegram İnteqrasiyası**: Agentlər üçün Telegram bildirişləri
- **Slack İnteqrasiyası**: Daxili komanda üçün Slack bildirişləri

## 🛠 Texniki Arxitektura

### Frontend Texnologiyaları
- **Next.js 15**: React framework, App Router
- **TypeScript**: Type safety üçün
- **Tailwind CSS**: Styling və responsive design
- **Framer Motion**: Animasiyalar və interaktiv elementlər
- **React Hook Form**: Form idarəetməsi
- **Zod**: Schema validation

### Backend Texnologiyaları
- **Next.js API Routes**: Server-side API endpoints
- **Supabase**: Database və authentication
- **PostgreSQL**: Əsas verilənlər bazası
- **Row Level Security (RLS)**: Təhlükəsizlik

### Database Schema

#### Əsas Cədvəllər
```sql
-- Profil cədvəli (istifadəçilər)
profiles (id, email, full_name, role, status, created_at)

-- Müraciət cədvəli
applications (id, full_name, email, phone, age, gender, 
             coverage_amount, term_years, smoker, 
             premium_estimate, status, assigned_agent_id, 
             notes, created_at)

-- Bildiriş cədvəli
notifications (id, type, title, message, target_user_id, 
               action_url, read, created_at)

-- Kalkulyator konfiqurasiyası
calculator_config (id, version, is_active, effective_from, 
                  description, config)
```

### API Endpoints

#### Public API
- `POST /api/applications` - Yeni müraciət yaratmaq
- `GET /api/analytics` - Analytics məlumatları

#### Admin API
- `GET /api/admin/dashboard` - Dashboard məlumatları
- `GET /api/admin/applications` - Müraciətlərin siyahısı
- `PUT /api/admin/applications/status` - Status dəyişikliyi
- `POST /api/admin/applications/assign` - Agent təyinatı
- `GET /api/admin/applications/export` - Məlumatları export etmək
- `GET /api/admin/agents` - Agent siyahısı
- `POST /api/admin/agents/invite` - Yeni agent dəvət etmək
- `DELETE /api/admin/agents/[id]` - Agent silmək

### Təhlükəsizlik
- **Authentication**: Supabase Auth
- **Authorization**: Role-based access control (RBAC)
- **Row Level Security**: Database səviyyəsində təhlükəsizlik
- **Environment Variables**: Sensitive məlumatların təhlükəsiz saxlanması

### Deployment
- **Platform**: Vercel
- **Database**: Supabase (PostgreSQL)
- **CDN**: Vercel Edge Network
- **Environment**: Production, Preview, Development

## 🚀 Quraşdırma və İstifadə

### Tələblər
- Node.js 18+
- npm/yarn/pnpm
- Supabase hesabı

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
APP_BASE_URL=your_app_url
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_DEFAULT_CHAT_ID=your_default_chat_id
EMAIL_SERVER_HOST=your_email_host
EMAIL_SERVER_PORT=your_email_port
EMAIL_SERVER_USER=your_email_user
EMAIL_SERVER_PASS=your_email_pass
EMAIL_FROM=your_email_from
SLACK_WEBHOOK_URL=your_slack_webhook_url
ADMIN_SETUP_TOKEN=your_admin_setup_token
```

### Quraşdırma
```bash
# Repository-ni klonlayın
git clone https://github.com/your-username/discovery-task.git

# Dependencies quraşdırın
npm install

# Environment variables tənzimləyin
cp .env.example .env.local

# Development server başladın
npm run dev
```

### Database Quraşdırması
1. Supabase-də yeni project yaradın
2. `supabase/schema.sql` faylını çalışdırın
3. RLS policies quraşdırın
4. Admin istifadəçi yaradın

## 📱 Funksionallıqlar

### Müştəri Tərəfi
- **Responsive Landing Page**: Bütün cihazlarda işləyən
- **İnteraktiv Kalkulyator**: Real-time premium hesablanması
- **Müraciət Formu**: 3 addımlı müraciət prosesi
- **Status İzləmə**: Müraciət statusunun izlənilməsi

### Admin Panel
- **Real-time Dashboard**: Canlı statistikalar
- **Müraciət İdarəetməsi**: Pagination, filtering, bulk actions
- **Agent İdarəetməsi**: Agent qəbulu və idarəetməsi
- **Kalkulyator Tənzimləməsi**: Premium hesablama qaydalarının tənzimlənməsi
- **Bildiriş Sistemi**: Real-time bildirişlər
- **Export Funksionallığı**: CSV/Excel export

### Agent Tərəfi
- **Müraciət İdarəetməsi**: Təyin edilmiş müraciətlərin idarə edilməsi
- **Status Dəyişikliyi**: Müraciət statuslarının dəyişdirilməsi
- **Müştəri Kommunikasiyası**: Müştərilərlə əlaqə

## 🔧 Texniki Xüsusiyyətlər

### Performance
- **Server-Side Rendering (SSR)**: Sürətli yükləmə
- **Static Generation**: Statik səhifələrin pre-generation
- **Image Optimization**: Avtomatik şəkil optimizasiyası
- **Code Splitting**: Lazy loading

### SEO
- **Meta Tags**: Avtomatik meta tag generation
- **Sitemap**: Avtomatik sitemap generation
- **Open Graph**: Social media sharing
- **Structured Data**: Search engine optimization

### Monitoring
- **Error Tracking**: Xəta izləmə
- **Performance Monitoring**: Performans izləmə
- **Analytics**: İstifadəçi davranışı analizi

## 📊 Analytics və Reporting

### Dashboard Metrikaları
- Ümumi müraciət sayı
- Aylıq müraciət artımı
- Agent performansı
- Premium hesablanması statistikaları
- Status paylanması

### Export Funksionallığı
- CSV formatında məlumat export
- Excel formatında məlumat export
- Filtered data export
- Date range export

## 🔐 Təhlükəsizlik

### Authentication
- Supabase Auth istifadə edilir
- JWT token-based authentication
- Session management

### Authorization
- Role-based access control
- Superadmin və Agent rolları
- Page-level access control

### Data Protection
- Row Level Security (RLS)
- Environment variables
- Secure API endpoints

## 🚀 Deployment

### Vercel Deployment
1. GitHub repository-ni Vercel-ə bağlayın
2. Environment variables tənzimləyin
3. Automatic deployment aktivləşdirin

### Database Setup
1. Supabase project yaradın
2. Schema import edin
3. RLS policies quraşdırın
4. Admin user yaradın

## 📞 Dəstək və Əlaqə

- **Email**: suleymanli95@hotmail.com
- **Demo**: [https://planb-insure.vercel.app/](https://planb-insure.vercel.app/)

## 📄 Lisenziya

Bu layihə MIT lisenziyası altında yayımlanır.

---

**PlanB Sığorta** - Plan A ilə risk alırsan, PlanB var! 🚀