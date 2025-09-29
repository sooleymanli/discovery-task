# Supabase Email Templates - Azərbaycan Dili

## Reset Password Email Template

### Subject (Mövzu):
```
Şifrənizi Yeniləyin - LifeSecure Admin Panel
```

### Body (Məzmun):
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
  <div style="background: linear-gradient(135deg, #3B82F6, #06B6D4); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">LifeSecure Admin Panel</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Şifrə Yeniləmə</p>
  </div>
  
  <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">Salam!</h2>
    
    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
      Admin panel hesabınız üçün şifrə yeniləmə tələbi aldıq. Şifrənizi yeniləmək üçün aşağıdakı düyməyə klik edin:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" 
         style="display: inline-block; background: linear-gradient(135deg, #3B82F6, #06B6D4); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
        Şifrənizi Yeniləmək Üçün Bu Linkə Klik Edin
      </a>
    </div>
    
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">⚠️ Təhlükəsizlik Məlumatı:</p>
      <ul style="color: #6b7280; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.5;">
        <li>Bu link 24 saat ərzində etibarlıdır</li>
        <li>Əgər siz bu tələbi göndərməmisinizsə, bu email-i görməzlikdən gəlin</li>
        <li>Şifrənizi heç kimə paylaşmayın</li>
      </ul>
    </div>
    
    <p style="color: #9ca3af; font-size: 14px; margin: 30px 0 0 0; text-align: center;">
      Bu email avtomatik olaraq göndərilmişdir. Cavab verməyin.
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px;">
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
      © 2024 LifeSecure. Bütün hüquqlar qorunur.
    </p>
  </div>
</div>
```

## Konfiqurasiya Addımları:

1. **Supabase Dashboard**-a daxil ol
2. **Authentication** → **Email Templates** bölməsinə keç
3. **Reset Password** template-ini seç
4. **Subject** sahəsini yuxarıdakı mövzu ilə əvəz et
5. **Body** sahəsini yuxarıdakı HTML məzmunu ilə əvəz et
6. **Save** düyməsinə bas

## Əlavə Məlumatlar:

- **Redirect URL**: `http://localhost:3005/admin/reset-password` (development)
- **Production URL**: `https://yourdomain.com/admin/reset-password`
- **Email Provider**: Supabase default SMTP istifadə edir
- **Custom SMTP**: Əgər öz email provider-in istifadə etmək istəyirsənsə, Settings → Auth → SMTP Settings-də konfiqurasiya et
