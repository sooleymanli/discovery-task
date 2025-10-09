import type { SupportedLocale } from './config';

type Dictionary = Record<string, string>;

const az: Dictionary = {
  brand_name: 'PlanB',
  brand_tag: 'Sığorta',
  slogan: 'Plan A ilə risk alırsan, PlanB var!',
  apply_cta: 'PlanB al',
  track_application: 'Müraciəti izlə',
  nav_calculator: 'Hesablama',
  nav_features: 'Xüsusiyyətlər',
  nav_faq: 'Suallar',
  footer_products: 'PlanB Məhsulları',
  footer_support: 'Dəstək',
  footer_company: 'PlanB',
  privacy_policy: 'Məxfilik Siyasəti',
  terms_of_use: 'İstifadə Şərtləri',
  cookie_policy: 'Cookie Siyasəti',
  admin_panel: 'PlanB Admin Panel',
  logout: 'Çıxış',
  overview: 'İcmal',
  messaging: 'Mesaj Göndər',
  applications: 'Müraciətlər',
  agents: 'Agentlər',
  calculator: 'Kalkulyator',
  settings: 'Tənzimləmələr',
  go_to_site: 'Sayta keçid et',
  // Landing
  lp_badge: 'PlanB Sığorta • Gənclər üçün',
  lp_hero_line1: 'Plan A ilə',
  lp_hero_line2: 'risk alırsan',
  lp_hero_line3: 'PlanB var!',
  lp_hero_sub_1: '“Gənclər üçün həyat sığortası - ”',
  lp_hero_sub_2: '2 dəqiqəyə qiymət',
  lp_hero_sub_3: '5 dəqiqəyə PlanB!',
  lp_cta_calc: 'PlanB qiymətini al',
  lp_cta_apply: 'PlanB al',
  lp_fast: 'Tez nəticə',
  lp_24_7: '24/7 müraciət',
  lp_for_young: 'Gənclər üçün',
  calc_badge: 'PlanB Kalkulyatoru',
  calc_title: 'PlanB qiymətini hesabla',
  calc_desc_1: 'Sadə formla təxmini aylıq ödənişi öyrənin.',
  calc_desc_2: '100% pulsuz',
  calc_desc_3: 'dəqiq',
  form_age: 'Yaş',
  form_age_ph: 'məs: 25',
  form_age_helper: '18–65 yaş aralığı',
  form_gender: 'Cins',
  form_gender_m: 'Kişi',
  form_gender_f: 'Qadın',
  form_amount: 'Sığorta məbləği (AZN)',
  form_amount_ph: 'məs: 100000',
  form_amount_helper: 'Minimum 10,000 AZN',
  form_term: 'Müddət (il)',
  form_term_ph: 'məs: 20',
  form_years: 'il',
  form_smoker: 'Siqaret çəkir',
  calc_btn: 'PlanB qiymətini hesabla',
  calc_processing: 'Hesablanır...',
  calc_step_1: 'Məlumatları yoxlayır...',
  calc_step_2: 'Risk faktörlərini hesablayır...',
  calc_step_3: 'Yaş və cins analizi...',
  calc_step_4: 'Sığorta məbləğini qiymətləndirir...',
  calc_step_5: 'Yekun hesablama...',
  calc_loading_title: 'PlanB Hesablanır',
  calc_loading_desc: 'Zəhmət olmasa gözləyin...',
  result_ready_title: 'PlanB Qiyməti Hazırdır! ',
  result_ready_desc: 'Təbriklər! Sizin üçün ən yaxşı qiymət',
  result_monthly: 'aylıq ödəniş',
  result_apply_now: 'PlanB al - İndi müraciət et!',
  result_recalculate: 'Yenidən hesabla',
  tips_title: '💡 İpucu',
  tips_higher: 'Daha yüksək məbləğ → daha çox ödəniş',
  tips_longer: 'Uzun müddət → faktor artır',
  tips_smoker: 'Siqaret çəkən → əlavə risk',
  tips_selected: '📊 Seçilən dəyərlər',
  tips_age: 'Yaş',
  tips_gender: 'Cins',
  tips_amount: 'Məbləğ',
  tips_term: 'Müddət',
  tips_smoke: 'Siqaret',
  tips_yes: 'Bəli',
  tips_no: 'Xeyr',
  features_badge: 'PlanB Xüsusiyyətləri',
  features_title: 'Niyə PlanB?',
  feature_fast_title: 'Sürətli Proses',
  feature_fast_desc: '2 dəqiqədə qiymət al, 5 dəqiqədə PlanB al!',
  feature_secure_title: 'Təhlükəsizlik',
  feature_secure_desc: 'Məlumatlarınız 256-bit şifrələmə ilə qorunur. 100% təhlükəsiz.',
  feature_mobile_title: 'Mobil Uyğun',
  feature_mobile_desc: 'İstənilən cihazdan istifadə edin. iOS, Android, Desktop.',
  feature_transparent_title: 'Şəffaflıq',
  feature_transparent_desc: 'Gizli yox! Bütün şərtlər açıq və şəffaf.',
  feature_youth_title: 'Gənclər üçün',
  feature_youth_desc: '18-30 yaş arası üçün xüsusi qiymətlər.',
  feature_planb_title: 'PlanB',
  feature_planb_desc: 'Plan A ilə risk alırsan, PlanB var!',
  cta_ready_title: 'Hazırsan PlanB almağa?',
  cta_ready_desc: 'Gənc peşəkarlar üçün ən yaxşı sığorta həlli',
  cta_ready_btn: 'PlanB al - İndi başla!'
};

const en: Dictionary = {
  brand_name: 'PlanB',
  brand_tag: 'Insurance',
  slogan: 'With Plan A you risk it, choose PlanB!',
  apply_cta: 'Get PlanB',
  track_application: 'Track application',
  nav_calculator: 'Calculator',
  nav_features: 'Features',
  nav_faq: 'FAQ',
  footer_products: 'PlanB Products',
  footer_support: 'Support',
  footer_company: 'PlanB',
  privacy_policy: 'Privacy Policy',
  terms_of_use: 'Terms of Use',
  cookie_policy: 'Cookie Policy',
  admin_panel: 'PlanB Admin Panel',
  logout: 'Logout',
  overview: 'Overview',
  messaging: 'Messaging',
  applications: 'Applications',
  agents: 'Agents',
  calculator: 'Calculator',
  settings: 'Settings',
  go_to_site: 'Go to site',
  lp_badge: 'PlanB Insurance • For youth',
  lp_hero_line1: 'With Plan A',
  lp_hero_line2: 'you risk it',
  lp_hero_line3: 'choose PlanB!',
  lp_hero_sub_1: '“Life insurance for youth - ”',
  lp_hero_sub_2: 'Quote in 2 minutes',
  lp_hero_sub_3: 'PlanB in 5 minutes!',
  lp_cta_calc: 'Get PlanB quote',
  lp_cta_apply: 'Get PlanB',
  lp_fast: 'Fast result',
  lp_24_7: 'Apply 24/7',
  lp_for_young: 'For youth',
  calc_badge: 'PlanB Calculator',
  calc_title: 'Calculate PlanB quote',
  calc_desc_1: 'Use a simple form to estimate monthly payment.',
  calc_desc_2: '100% free',
  calc_desc_3: 'accurate',
  form_age: 'Age',
  form_age_ph: 'e.g. 25',
  form_age_helper: 'Range 18–65',
  form_gender: 'Gender',
  form_gender_m: 'Male',
  form_gender_f: 'Female',
  form_amount: 'Coverage amount (AZN)',
  form_amount_ph: 'e.g. 100000',
  form_amount_helper: 'Minimum 10,000 AZN',
  form_term: 'Term (years)',
  form_term_ph: 'e.g. 20',
  form_years: 'years',
  form_smoker: 'Smoker',
  calc_btn: 'Calculate PlanB quote',
  calc_processing: 'Calculating...',
  calc_step_1: 'Validating data...',
  calc_step_2: 'Scoring risk factors...',
  calc_step_3: 'Age and gender analysis...',
  calc_step_4: 'Evaluating coverage...',
  calc_step_5: 'Finalizing...',
  calc_loading_title: 'Calculating PlanB',
  calc_loading_desc: 'Please wait...',
  result_ready_title: 'PlanB Quote Ready!',
  result_ready_desc: 'Congrats! Your best price is ready',
  result_monthly: 'monthly payment',
  result_apply_now: 'Get PlanB — Apply now!',
  result_recalculate: 'Recalculate',
  tips_title: '💡 Tip',
  tips_higher: 'Higher amount → higher payment',
  tips_longer: 'Longer term → higher factor',
  tips_smoker: 'Smoker → extra risk',
  tips_selected: '📊 Selected values',
  tips_age: 'Age',
  tips_gender: 'Gender',
  tips_amount: 'Amount',
  tips_term: 'Term',
  tips_smoke: 'Smoke',
  tips_yes: 'Yes',
  tips_no: 'No',
  features_badge: 'PlanB Features',
  features_title: 'Why PlanB?',
  feature_fast_title: 'Fast Process',
  feature_fast_desc: 'Get quote in 2 minutes, PlanB in 5!',
  feature_secure_title: 'Security',
  feature_secure_desc: 'Your data is protected with 256-bit encryption. 100% secure.',
  feature_mobile_title: 'Mobile Friendly',
  feature_mobile_desc: 'Use any device. iOS, Android, Desktop.',
  feature_transparent_title: 'Transparency',
  feature_transparent_desc: 'No hidden fees! All terms are clear.',
  feature_youth_title: 'For Youth',
  feature_youth_desc: 'Special prices for ages 18–30.',
  feature_planb_title: 'PlanB',
  feature_planb_desc: 'With Plan A you risk it, choose PlanB!',
  cta_ready_title: 'Ready to get PlanB?',
  cta_ready_desc: 'The best insurance for young professionals',
  cta_ready_btn: 'Get PlanB — Start now!'
};

const ru: Dictionary = {
  brand_name: 'PlanB',
  brand_tag: 'Страхование',
  slogan: 'С Планом A рискуешь, выбирай PlanB!',
  apply_cta: 'Купить PlanB',
  track_application: 'Отслеживать заявку',
  nav_calculator: 'Калькулятор',
  nav_features: 'Возможности',
  nav_faq: 'Вопросы',
  footer_products: 'Продукты PlanB',
  footer_support: 'Поддержка',
  footer_company: 'PlanB',
  privacy_policy: 'Политика конфиденциальности',
  terms_of_use: 'Условия использования',
  cookie_policy: 'Политика Cookie',
  admin_panel: 'Панель PlanB',
  logout: 'Выйти',
  overview: 'Обзор',
  messaging: 'Сообщения',
  applications: 'Заявки',
  agents: 'Агенты',
  calculator: 'Калькулятор',
  settings: 'Настройки',
  go_to_site: 'Перейти на сайт',
  lp_badge: 'PlanB Страхование • Для молодёжи',
  lp_hero_line1: 'С Планом A',
  lp_hero_line2: 'рискуешь',
  lp_hero_line3: 'выбирай PlanB!',
  lp_hero_sub_1: '“Страхование жизни для молодёжи — ”',
  lp_hero_sub_2: 'Котировка за 2 минуты',
  lp_hero_sub_3: 'PlanB за 5 минут!',
  lp_cta_calc: 'Получить котировку PlanB',
  lp_cta_apply: 'Купить PlanB',
  lp_fast: 'Быстрый результат',
  lp_24_7: 'Заявка 24/7',
  lp_for_young: 'Для молодёжи',
  calc_badge: 'Калькулятор PlanB',
  calc_title: 'Рассчитать котировку PlanB',
  calc_desc_1: 'Простой формой оцените ежемесячный платёж.',
  calc_desc_2: '100% бесплатно',
  calc_desc_3: 'точно',
  form_age: 'Возраст',
  form_age_ph: 'напр. 25',
  form_age_helper: 'Диапазон 18–65',
  form_gender: 'Пол',
  form_gender_m: 'Мужской',
  form_gender_f: 'Женский',
  form_amount: 'Страховая сумма (AZN)',
  form_amount_ph: 'напр. 100000',
  form_amount_helper: 'Минимум 10 000 AZN',
  form_term: 'Срок (лет)',
  form_term_ph: 'напр. 20',
  form_years: 'лет',
  form_smoker: 'Курит',
  calc_btn: 'Рассчитать котировку PlanB',
  calc_processing: 'Расчёт...',
  calc_step_1: 'Проверяем данные...',
  calc_step_2: 'Оцениваем риски...',
  calc_step_3: 'Анализ возраста и пола...',
  calc_step_4: 'Оценка страховой суммы...',
  calc_step_5: 'Финализация...',
  calc_loading_title: 'Расчёт PlanB',
  calc_loading_desc: 'Пожалуйста, подождите...',
  result_ready_title: 'Котировка PlanB готова!',
  result_ready_desc: 'Поздравляем! Лучшая цена готова',
  result_monthly: 'ежемесячный платёж',
  result_apply_now: 'Купить PlanB — Оформить сейчас!',
  result_recalculate: 'Пересчитать',
  tips_title: '💡 Подсказка',
  tips_higher: 'Больше сумма → больше платёж',
  tips_longer: 'Дольше срок → выше коэффициент',
  tips_smoker: 'Курит → доп. риск',
  tips_selected: '📊 Выбранные значения',
  tips_age: 'Возраст',
  tips_gender: 'Пол',
  tips_amount: 'Сумма',
  tips_term: 'Срок',
  tips_smoke: 'Курение',
  tips_yes: 'Да',
  tips_no: 'Нет',
  features_badge: 'Возможности PlanB',
  features_title: 'Почему PlanB?',
  feature_fast_title: 'Быстрый процесс',
  feature_fast_desc: 'Котировка за 2 минуты, PlanB за 5!',
  feature_secure_title: 'Безопасность',
  feature_secure_desc: 'Ваши данные защищены 256-битным шифрованием. 100% безопасно.',
  feature_mobile_title: 'Мобильно',
  feature_mobile_desc: 'Любое устройство: iOS, Android, Desktop.',
  feature_transparent_title: 'Прозрачность',
  feature_transparent_desc: 'Никаких скрытых платежей! Все условия ясны.',
  feature_youth_title: 'Для молодёжи',
  feature_youth_desc: 'Спеццены для 18–30 лет.',
  feature_planb_title: 'PlanB',
  feature_planb_desc: 'С Планом A рискуешь, выбирай PlanB!',
  cta_ready_title: 'Готовы получить PlanB?',
  cta_ready_desc: 'Лучшее страхование для молодых профессионалов',
  cta_ready_btn: 'Купить PlanB — Начать сейчас!'
};

// Extend shared UI keys across all locales
az['nc_title'] = 'Bildirişlər';
az['nc_mark_all'] = 'Hamısını oxunmuş say';
az['nc_empty_title'] = 'Bildiriş yoxdur';
az['nc_empty_desc'] = 'Yeni bildirişlər burada görünəcək';
az['footer_intro_1'] = 'Gənc insanlar üçün həyatlarını sığortalayır.';
az['footer_intro_2'] = 'Gələcəyinizi qoruyun, risk almayın!';
az['footer_products_life'] = 'PlanB Həyat';
az['footer_products_family'] = 'PlanB Ailə';
az['footer_products_career'] = 'PlanB Karyera';
az['footer_products_youth'] = 'PlanB Gənclər';
az['footer_desc_life'] = 'Əsas həyat sığortası';
az['footer_desc_family'] = 'Ailə üçün sığorta';
az['footer_desc_career'] = 'Peşəkar sığorta';
az['footer_desc_youth'] = '18-30 yaş üçün';
az['footer_contact'] = 'Əlaqə';
az['footer_faq'] = 'Tez-tez verilən suallar';
az['footer_help'] = 'Yardım mərkəzi';
az['footer_chat'] = 'Onlayn söhbət';
az['footer_whatsapp'] = 'WhatsApp dəstək';
az['footer_about'] = 'Haqqımızda';
az['footer_career'] = 'Karyera';
az['footer_blog'] = 'Blog';
az['footer_news'] = 'Xəbərlər';
az['footer_partners'] = 'Partnyorlar';

en['nc_title'] = 'Notifications';
en['nc_mark_all'] = 'Mark all as read';
en['nc_empty_title'] = 'No notifications';
en['nc_empty_desc'] = 'New notifications will appear here';
en['footer_intro_1'] = 'Life insurance for young people.';
en['footer_intro_2'] = 'Protect your future, avoid risk!';
en['footer_products_life'] = 'PlanB Life';
en['footer_products_family'] = 'PlanB Family';
en['footer_products_career'] = 'PlanB Career';
en['footer_products_youth'] = 'PlanB Youth';
en['footer_desc_life'] = 'Core life insurance';
en['footer_desc_family'] = 'Family insurance';
en['footer_desc_career'] = 'Professional insurance';
en['footer_desc_youth'] = 'For ages 18-30';
en['footer_contact'] = 'Contact';
en['footer_faq'] = 'Frequently Asked Questions';
en['footer_help'] = 'Help center';
en['footer_chat'] = 'Online chat';
en['footer_whatsapp'] = 'WhatsApp support';
en['footer_about'] = 'About us';
en['footer_career'] = 'Careers';
en['footer_blog'] = 'Blog';
en['footer_news'] = 'News';
en['footer_partners'] = 'Partners';

ru['nc_title'] = 'Уведомления';
ru['nc_mark_all'] = 'Отметить все прочитанными';
ru['nc_empty_title'] = 'Нет уведомлений';
ru['nc_empty_desc'] = 'Новые уведомления появятся здесь';
ru['footer_intro_1'] = 'Страхование жизни для молодёжи.';
ru['footer_intro_2'] = 'Защитите будущее, не рискуйте!';
ru['footer_products_life'] = 'PlanB Жизнь';
ru['footer_products_family'] = 'PlanB Семья';
ru['footer_products_career'] = 'PlanB Карьера';
ru['footer_products_youth'] = 'PlanB Молодёжь';
ru['footer_desc_life'] = 'Базовое страхование жизни';
ru['footer_desc_family'] = 'Страхование для семьи';
ru['footer_desc_career'] = 'Профессиональное страхование';
ru['footer_desc_youth'] = 'Для 18–30 лет';
ru['footer_contact'] = 'Контакты';
ru['footer_faq'] = 'Частые вопросы';
ru['footer_help'] = 'Центр помощи';
ru['footer_chat'] = 'Онлайн чат';
ru['footer_whatsapp'] = 'Поддержка WhatsApp';
ru['footer_about'] = 'О нас';
ru['footer_career'] = 'Карьера';
ru['footer_blog'] = 'Блог';
ru['footer_news'] = 'Новости';
ru['footer_partners'] = 'Партнёры';

// Apply page
az['apply_badge'] = 'PlanB Müraciət';
az['apply_title'] = 'PlanB al - İndi başla!';
az['apply_subtitle'] = 'Gənclər üçün xüsusi hazırlanmış sığorta həlli.';
az['apply_success_title'] = 'Müraciət qəbul edildi!';
az['apply_success_desc'] = 'PlanB komandası 24 saat ərzində sizinlə əlaqə saxlayacaq. Emailinizi yoxlayın.';
az['apply_error_title'] = 'Xəta baş verdi';
az['apply_error_default'] = 'Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.';
az['apply_section1'] = 'Şəxsi məlumatlar';
az['apply_section2'] = 'Sığorta məlumatları';
az['apply_section3'] = 'Əlavə məlumatlar';
az['apply_full_name'] = 'Ad Soyad';
az['apply_full_name_ph'] = 'Adınızı daxil edin';
az['apply_email'] = 'Email';
az['apply_phone'] = 'Telefon';
az['apply_phone_ph'] = '+994 XX XXX XX XX';
az['apply_age_ph'] = '18-65';
az['apply_smoker_label'] = 'Siqaret çəkirəm';
az['apply_consent'] = 'Şərtlər və məxfilik qaydaları ilə razıyam. Məlumatlarımın PlanB tərəfindən işlənməsinə icazə verirəm.';
az['apply_consent_required'] = 'Razılıq tələb olunur';
az['apply_submitting'] = 'PlanB yaradılır...';
az['apply_submit'] = 'PlanB al - İndi başla!';
az['apply_back'] = 'Ana səhifəyə qayıt';
az['loading'] = 'Yüklənir...';
az['hero_card1_title'] = 'Sürətli';
az['hero_card1_desc'] = '2 dəqiqə';
az['hero_card2_title'] = 'Gənclər';
az['hero_card2_desc'] = '18-30 yaş';
az['hero_card3_title'] = 'Şəffaf';
az['hero_card3_desc'] = 'Gizli yox';
az['hero_card4_title'] = 'PlanB';
az['hero_card4_desc'] = 'Risk yox';
az['features_desc'] = 'Gənclər üçün xüsusi hazırlanmış modern sığorta həlləri. Sadə, sürətli və etibarlı.';
az['faq_title'] = 'Tez-tez verilən suallar';
az['faq_desc'] = 'PlanB haqqında ən çox soruşulan suallar və cavabları. Hər şey açıq və şəffaf.';
az['faq1_q'] = 'PlanB kalkulyatoru nə qədər dəqiqdir?';
az['faq1_a'] = 'PlanB kalkulyatoru %95 dəqiqlik ilə təxmini qiymət verir. Dəqiq qiymət üçün mütəxəssisimiz sizinlə əlaqə saxlayaraq məlumatları təsdiqləyir.';
az['faq2_q'] = 'Məlumatlarım təhlükəsizdirmi?';
az['faq2_a'] = 'Bəli, 100% təhlükəsizdir! Bank səviyyəli 256-bit şifrələmə tətbiq olunur. Yalnız yetkili heyətimiz məlumatlarınızı görə bilər.';
az['faq3_q'] = 'PlanB almaq üçün nə qədər vaxt lazımdır?';
az['faq3_a'] = '2 dəqiqədə qiymət al, 5 dəqiqədə PlanB al! Bütün proses onlayn həyata keçirilir.';
az['faq4_q'] = 'Gənclər üçün xüsusi qiymətlər varmı?';
az['faq4_a'] = 'Bəli! 18-30 yaş arası üçün xüsusi endirimlər təklif edirik. Gənc peşəkarlar üçün daha uyğun qiymətlər.';
az['faq5_q'] = 'Müraciətdən sonra nə baş verir?';
az['faq5_a'] = 'Mütəxəssisimiz 24 saat ərzində sizinlə əlaqə saxlayır. Sənədləri yoxlayır, dəqiq qiymət verir və PlanB aktivləşdirir.';
az['faq6_q'] = 'PlanB nə üçün fərqlidir?';
az['faq6_a'] = 'Plan A ilə risk alırsan, PlanB var! Gənclər üçün xüsusi hazırlanmış, şəffaf, sürətli və etibarlı sığorta həlli.';
az['faq_contact_title'] = 'Sualınız yoxdur?';
az['faq_contact_desc'] = 'PlanB komandası sizinlə əlaqə saxlayaraq bütün suallarınızı cavablandıracaq';
az['faq_contact_btn'] = 'PlanB al - Suallarınızı soruşun';

// Portal page
az['portal_badge'] = 'Müraciət Portalı';
az['portal_title'] = 'Müraciətinizi izləyin';
az['portal_subtitle'] = 'Müraciət ID və email ilə statusu görün, sual verin.';
az['portal_login_title'] = 'Giriş';
az['portal_login_desc'] = 'Məlumatlarınızı daxil edib nəticəni görün.';
az['portal_app_id'] = 'Müraciət ID';
az['portal_app_id_ph'] = 'UUID';
az['portal_email_ph'] = 'example@mail.com';
az['portal_show_status'] = 'Statusu göstər';
az['portal_empty_title'] = 'Məlumat daxil edin';
az['portal_empty_desc'] = 'Müraciət ID və email daxil etdikdən sonra panel görünəcək.';
az['portal_agent'] = 'Agent';
az['portal_status'] = 'Status';
az['portal_refresh'] = 'Yenilə';
az['portal_no_messages'] = 'Hələ mesaj yoxdur';
az['portal_you'] = 'Siz';
az['portal_admin'] = 'Admin';
az['portal_message_ph'] = 'Sualınızı yazın...';
az['portal_send'] = 'Göndər';
az['portal_msg_sent'] = 'Mesaj göndərildi';
az['portal_error_incomplete'] = 'Məlumatlar natamamdır';
az['portal_error_notfound'] = 'Tapılmadı';
az['portal_error_failed'] = 'Göndərilmədi';
az['portal_error'] = 'Xəta';

en['apply_badge'] = 'PlanB Application';
en['apply_title'] = 'Get PlanB - Start now!';
en['apply_subtitle'] = 'Insurance solution specially designed for youth.';
en['apply_success_title'] = 'Application received!';
en['apply_success_desc'] = 'PlanB team will contact you within 24 hours. Check your email.';
en['apply_error_title'] = 'Error occurred';
en['apply_error_default'] = 'An error occurred. Please try again.';
en['apply_section1'] = 'Personal information';
en['apply_section2'] = 'Insurance information';
en['apply_section3'] = 'Additional information';
en['apply_full_name'] = 'Full Name';
en['apply_full_name_ph'] = 'Enter your name';
en['apply_email'] = 'Email';
en['apply_phone'] = 'Phone';
en['apply_phone_ph'] = '+994 XX XXX XX XX';
en['apply_age_ph'] = '18-65';
en['apply_smoker_label'] = 'I smoke';
en['apply_consent'] = 'I agree with the terms and privacy policy. I allow PlanB to process my data.';
en['apply_consent_required'] = 'Consent is required';
en['apply_submitting'] = 'Creating PlanB...';
en['apply_submit'] = 'Get PlanB - Start now!';
en['apply_back'] = 'Back to home';
en['loading'] = 'Loading...';
en['hero_card1_title'] = 'Fast';
en['hero_card1_desc'] = '2 minutes';
en['hero_card2_title'] = 'Youth';
en['hero_card2_desc'] = '18-30 years';
en['hero_card3_title'] = 'Transparent';
en['hero_card3_desc'] = 'No hidden fees';
en['hero_card4_title'] = 'PlanB';
en['hero_card4_desc'] = 'No risk';
en['features_desc'] = 'Modern insurance solutions specially designed for youth. Simple, fast and reliable.';
en['faq_title'] = 'Frequently Asked Questions';
en['faq_desc'] = 'Most asked questions about PlanB and answers. Everything is open and transparent.';
en['faq1_q'] = 'How accurate is PlanB calculator?';
en['faq1_a'] = 'PlanB calculator provides approximate quote with 95% accuracy. For exact price our specialist will contact you to confirm details.';
en['faq2_q'] = 'Is my data secure?';
en['faq2_a'] = 'Yes, 100% secure! Bank-level 256-bit encryption is applied. Only authorized staff can view your data.';
en['faq3_q'] = 'How long does it take to get PlanB?';
en['faq3_a'] = 'Get quote in 2 minutes, get PlanB in 5 minutes! The entire process is done online.';
en['faq4_q'] = 'Are there special prices for youth?';
en['faq4_a'] = 'Yes! We offer special discounts for ages 18-30. Better prices for young professionals.';
en['faq5_q'] = 'What happens after application?';
en['faq5_a'] = 'Our specialist contacts you within 24 hours. Reviews documents, provides exact price and activates PlanB.';
en['faq6_q'] = 'Why is PlanB different?';
en['faq6_a'] = 'With Plan A you risk it, choose PlanB! Specially designed for youth, transparent, fast and reliable insurance solution.';
en['faq_contact_title'] = 'Have questions?';
en['faq_contact_desc'] = 'PlanB team will contact you to answer all your questions';
en['faq_contact_btn'] = 'Get PlanB - Ask your questions';

// Portal page
en['portal_badge'] = 'Application Portal';
en['portal_title'] = 'Track your application';
en['portal_subtitle'] = 'View status and ask questions with application ID and email.';
en['portal_login_title'] = 'Login';
en['portal_login_desc'] = 'Enter your credentials to view results.';
en['portal_app_id'] = 'Application ID';
en['portal_app_id_ph'] = 'UUID';
en['portal_email_ph'] = 'example@mail.com';
en['portal_show_status'] = 'Show status';
en['portal_empty_title'] = 'Enter credentials';
en['portal_empty_desc'] = 'Panel will appear after entering application ID and email.';
en['portal_agent'] = 'Agent';
en['portal_status'] = 'Status';
en['portal_refresh'] = 'Refresh';
en['portal_no_messages'] = 'No messages yet';
en['portal_you'] = 'You';
en['portal_admin'] = 'Admin';
en['portal_message_ph'] = 'Write your question...';
en['portal_send'] = 'Send';
en['portal_msg_sent'] = 'Message sent';
en['portal_error_incomplete'] = 'Incomplete data';
en['portal_error_notfound'] = 'Not found';
en['portal_error_failed'] = 'Failed to send';
en['portal_error'] = 'Error';

ru['apply_badge'] = 'Заявка PlanB';
ru['apply_title'] = 'Купить PlanB - Начать сейчас!';
ru['apply_subtitle'] = 'Страховое решение, созданное для молодёжи.';
ru['apply_success_title'] = 'Заявка получена!';
ru['apply_success_desc'] = 'Команда PlanB свяжется с вами в течение 24 часов. Проверьте email.';
ru['apply_error_title'] = 'Произошла ошибка';
ru['apply_error_default'] = 'Произошла ошибка. Попробуйте ещё раз.';
ru['apply_section1'] = 'Личная информация';
ru['apply_section2'] = 'Страховая информация';
ru['apply_section3'] = 'Дополнительная информация';
ru['apply_full_name'] = 'Полное имя';
ru['apply_full_name_ph'] = 'Введите ваше имя';
ru['apply_email'] = 'Email';
ru['apply_phone'] = 'Телефон';
ru['apply_phone_ph'] = '+994 XX XXX XX XX';
ru['apply_age_ph'] = '18-65';
ru['apply_smoker_label'] = 'Я курю';
ru['apply_consent'] = 'Я согласен с условиями и политикой конфиденциальности. Разрешаю PlanB обрабатывать мои данные.';
ru['apply_consent_required'] = 'Требуется согласие';
ru['apply_submitting'] = 'Создание PlanB...';
ru['apply_submit'] = 'Купить PlanB - Начать сейчас!';
ru['apply_back'] = 'Вернуться на главную';
ru['loading'] = 'Загрузка...';
ru['hero_card1_title'] = 'Быстро';
ru['hero_card1_desc'] = '2 минуты';
ru['hero_card2_title'] = 'Молодёжь';
ru['hero_card2_desc'] = '18-30 лет';
ru['hero_card3_title'] = 'Прозрачно';
ru['hero_card3_desc'] = 'Без скрытых платежей';
ru['hero_card4_title'] = 'PlanB';
ru['hero_card4_desc'] = 'Без риска';
ru['features_desc'] = 'Современные страховые решения для молодёжи. Просто, быстро и надёжно.';
ru['faq_title'] = 'Частые вопросы';
ru['faq_desc'] = 'Самые частые вопросы о PlanB и ответы. Всё открыто и прозрачно.';
ru['faq1_q'] = 'Насколько точен калькулятор PlanB?';
ru['faq1_a'] = 'Калькулятор PlanB даёт приблизительную котировку с точностью 95%. Для точной цены наш специалист свяжется с вами для уточнения деталей.';
ru['faq2_q'] = 'Безопасны ли мои данные?';
ru['faq2_a'] = 'Да, 100% безопасно! Применяется шифрование 256-бит банковского уровня. Только авторизованный персонал может видеть ваши данные.';
ru['faq3_q'] = 'Сколько времени нужно чтобы получить PlanB?';
ru['faq3_a'] = 'Котировка за 2 минуты, PlanB за 5 минут! Весь процесс онлайн.';
ru['faq4_q'] = 'Есть ли специальные цены для молодёжи?';
ru['faq4_a'] = 'Да! Мы предлагаем специальные скидки для 18-30 лет. Лучшие цены для молодых профессионалов.';
ru['faq5_q'] = 'Что происходит после заявки?';
ru['faq5_a'] = 'Наш специалист свяжется с вами в течение 24 часов. Проверит документы, даст точную цену и активирует PlanB.';
ru['faq6_q'] = 'Чем отличается PlanB?';
ru['faq6_a'] = 'С Планом A рискуешь, выбирай PlanB! Специально для молодёжи, прозрачное, быстрое и надёжное страховое решение.';
ru['faq_contact_title'] = 'Есть вопросы?';
ru['faq_contact_desc'] = 'Команда PlanB свяжется с вами чтобы ответить на все вопросы';
ru['faq_contact_btn'] = 'Купить PlanB - Задать вопросы';

// Portal page
ru['portal_badge'] = 'Портал заявок';
ru['portal_title'] = 'Отслеживайте вашу заявку';
ru['portal_subtitle'] = 'Просмотр статуса и вопросы с ID заявки и email.';
ru['portal_login_title'] = 'Вход';
ru['portal_login_desc'] = 'Введите данные чтобы увидеть результаты.';
ru['portal_app_id'] = 'ID заявки';
ru['portal_app_id_ph'] = 'UUID';
ru['portal_email_ph'] = 'example@mail.com';
ru['portal_show_status'] = 'Показать статус';
ru['portal_empty_title'] = 'Введите данные';
ru['portal_empty_desc'] = 'Панель появится после ввода ID заявки и email.';
ru['portal_agent'] = 'Агент';
ru['portal_status'] = 'Статус';
ru['portal_refresh'] = 'Обновить';
ru['portal_no_messages'] = 'Пока нет сообщений';
ru['portal_you'] = 'Вы';
ru['portal_admin'] = 'Админ';
ru['portal_message_ph'] = 'Напишите ваш вопрос...';
ru['portal_send'] = 'Отправить';
ru['portal_msg_sent'] = 'Сообщение отправлено';
ru['portal_error_incomplete'] = 'Неполные данные';
ru['portal_error_notfound'] = 'Не найдено';
ru['portal_error_failed'] = 'Не удалось отправить';
ru['portal_error'] = 'Ошибка';

// Admin Login page
az['admin_login_title'] = 'Admin Login';
az['admin_login_desc'] = 'Hesab məlumatlarınızla daxil olun';
az['admin_email'] = 'Email';
az['admin_password'] = 'Şifrə';
az['admin_password_ph'] = '••••••••';
az['admin_logging_in'] = 'Giriş edilir...';
az['admin_login_btn'] = 'Daxil ol';
az['admin_forgot_password'] = 'Şifrəni unutdum?';
az['admin_reset_title'] = 'Şifrəni Yenilə';
az['admin_reset_desc'] = 'Emailinizə şifrə yeniləmə linki göndərəcəyik';
az['admin_reset_email_ph'] = 'Emailiniz daxil edin';
az['admin_reset_sending'] = 'Göndərilir...';
az['admin_reset_send'] = 'Link Göndər';
az['admin_back'] = 'Geri';
az['admin_reset_success'] = 'Şifrə yeniləmə linki emailinizə göndərildi!';
az['admin_reset_error'] = 'Xəta';

en['admin_login_title'] = 'Admin Login';
en['admin_login_desc'] = 'Sign in with your credentials';
en['admin_email'] = 'Email';
en['admin_password'] = 'Password';
en['admin_password_ph'] = '••••••••';
en['admin_logging_in'] = 'Logging in...';
en['admin_login_btn'] = 'Sign in';
en['admin_forgot_password'] = 'Forgot password?';
en['admin_reset_title'] = 'Reset Password';
en['admin_reset_desc'] = 'We will send a password reset link to your email';
en['admin_reset_email_ph'] = 'Enter your email';
en['admin_reset_sending'] = 'Sending...';
en['admin_reset_send'] = 'Send Link';
en['admin_back'] = 'Back';
en['admin_reset_success'] = 'Password reset link sent to your email!';
en['admin_reset_error'] = 'Error';

ru['admin_login_title'] = 'Admin Login';
ru['admin_login_desc'] = 'Войдите с вашими данными';
ru['admin_email'] = 'Email';
ru['admin_password'] = 'Пароль';
ru['admin_password_ph'] = '••••••••';
ru['admin_logging_in'] = 'Вход...';
ru['admin_login_btn'] = 'Войти';
ru['admin_forgot_password'] = 'Забыли пароль?';
ru['admin_reset_title'] = 'Сброс пароля';
ru['admin_reset_desc'] = 'Мы отправим ссылку для сброса пароля на ваш email';
ru['admin_reset_email_ph'] = 'Введите ваш email';
ru['admin_reset_sending'] = 'Отправка...';
ru['admin_reset_send'] = 'Отправить ссылку';
ru['admin_back'] = 'Назад';
ru['admin_reset_success'] = 'Ссылка для сброса пароля отправлена на ваш email!';
ru['admin_reset_error'] = 'Ошибка';

// Admin Dashboard
az['dashboard_loading'] = 'Yüklənir...';
az['dashboard_wait'] = 'Zəhmət olmasa gözləyin';
az['dashboard_error_profile'] = 'Profil məlumatları yüklənə bilmədi';
az['dashboard_error_data'] = 'Dashboard məlumatları yüklənə bilmədi';
az['dashboard_error'] = 'Xəta baş verdi';
az['dashboard_error_nodata'] = 'Məlumat yüklənə bilmədi';
az['dashboard_retry'] = 'Yenidən yoxla';
az['dashboard_overview'] = 'İcmal';
az['dashboard_stats_all'] = 'Ümumi statistika və analitika';
az['dashboard_stats_yours'] = 'Sizin müraciətləriniz';
az['dashboard_last_update'] = 'Son yenilənmə';
az['dashboard_refresh'] = 'Yenilə';
az['dashboard_calc_total'] = 'Kalkulyator Sorğuları (Cəm)';
az['dashboard_last_90'] = 'Son 90 gün';
az['dashboard_last_7'] = 'Son 7 Gün';
az['dashboard_calc_usage'] = 'Kalkulyator istifadəsi';
az['dashboard_avg_monthly'] = 'Orta Aylıq Ödəniş';
az['dashboard_server_calc'] = 'Server hesablaması';
az['dashboard_total_apps'] = 'Ümumi Müraciət';
az['dashboard_planb_apps'] = 'PlanB müraciətləri';
az['dashboard_active_agents'] = 'Aktiv Agent';
az['dashboard_working_agents'] = 'İşləyən agentlər';
az['dashboard_monthly_growth'] = 'Aylıq Artım';
az['dashboard_planb_growth'] = 'PlanB böyüməsi';
az['dashboard_conversion'] = 'Çevrilmə Faizi';
az['dashboard_calc_to_app'] = 'Kalkulyator → Müraciət';
az['dashboard_revenue'] = 'Gəlir Proqnozu';
az['dashboard_monthly_revenue'] = 'Aylıq gəlir';
az['dashboard_apps_section'] = 'Müraciətlər';
az['dashboard_apps_by_status'] = 'Müraciətlər Statusa Görə';
az['dashboard_by_age'] = 'Yaş Qruplarına Görə';
az['dashboard_gender_dist'] = 'Cinsiyyət Paylanması';
az['dashboard_coverage_dist'] = 'Sığorta Məbləği Paylanması';
az['dashboard_daily_trend'] = 'Günlük Müraciət Trendi';
az['dashboard_agents_section'] = 'Agentlər';
az['dashboard_agent_perf'] = 'Agent Performansı';
az['dashboard_peak_hours'] = 'Peak Saatlar';
az['dashboard_calc_section'] = 'Kalkulyator';
az['dashboard_calc_trend'] = 'Kalkulyator Trendi (14 gün)';
az['dashboard_by_gender'] = 'Cinsə Görə Sorğular';
az['dashboard_by_age_queries'] = 'Yaş Qruplarına Görə Sorğular';
az['dashboard_by_coverage'] = 'Məbləğ Aralıqlarına Görə Sorğular';
az['dashboard_most_params'] = 'Ən Çox İstifadə Olunan Parametrlər';
az['dashboard_your_apps'] = 'Sizin Müraciətləriniz';
az['dashboard_approved'] = 'Təsdiqlənmiş';
az['dashboard_successful'] = 'Uğurlu müraciətlər';
az['dashboard_pending'] = 'Gözləmədə';
az['dashboard_waiting'] = 'Gözləyən müraciətlər';
az['dashboard_your_by_status'] = 'Müraciətləriniz Statusa Görə';

en['dashboard_loading'] = 'Loading...';
en['dashboard_wait'] = 'Please wait';
en['dashboard_error_profile'] = 'Could not load profile data';
en['dashboard_error_data'] = 'Could not load dashboard data';
en['dashboard_error'] = 'An error occurred';
en['dashboard_error_nodata'] = 'Could not load data';
en['dashboard_retry'] = 'Retry';
en['dashboard_overview'] = 'Overview';
en['dashboard_stats_all'] = 'Overall statistics and analytics';
en['dashboard_stats_yours'] = 'Your applications';
en['dashboard_last_update'] = 'Last updated';
en['dashboard_refresh'] = 'Refresh';
en['dashboard_calc_total'] = 'Calculator Queries (Total)';
en['dashboard_last_90'] = 'Last 90 days';
en['dashboard_last_7'] = 'Last 7 Days';
en['dashboard_calc_usage'] = 'Calculator usage';
en['dashboard_avg_monthly'] = 'Avg Monthly Payment';
en['dashboard_server_calc'] = 'Server calculation';
en['dashboard_total_apps'] = 'Total Applications';
en['dashboard_planb_apps'] = 'PlanB applications';
en['dashboard_active_agents'] = 'Active Agents';
en['dashboard_working_agents'] = 'Working agents';
en['dashboard_monthly_growth'] = 'Monthly Growth';
en['dashboard_planb_growth'] = 'PlanB growth';
en['dashboard_conversion'] = 'Conversion Rate';
en['dashboard_calc_to_app'] = 'Calculator → Application';
en['dashboard_revenue'] = 'Revenue Forecast';
en['dashboard_monthly_revenue'] = 'Monthly revenue';
en['dashboard_apps_section'] = 'Applications';
en['dashboard_apps_by_status'] = 'Applications by Status';
en['dashboard_by_age'] = 'By Age Groups';
en['dashboard_gender_dist'] = 'Gender Distribution';
en['dashboard_coverage_dist'] = 'Coverage Amount Distribution';
en['dashboard_daily_trend'] = 'Daily Application Trend';
en['dashboard_agents_section'] = 'Agents';
en['dashboard_agent_perf'] = 'Agent Performance';
en['dashboard_peak_hours'] = 'Peak Hours';
en['dashboard_calc_section'] = 'Calculator';
en['dashboard_calc_trend'] = 'Calculator Trend (14 days)';
en['dashboard_by_gender'] = 'Queries by Gender';
en['dashboard_by_age_queries'] = 'Queries by Age Groups';
en['dashboard_by_coverage'] = 'Queries by Coverage Ranges';
en['dashboard_most_params'] = 'Most Used Parameters';
en['dashboard_your_apps'] = 'Your Applications';
en['dashboard_approved'] = 'Approved';
en['dashboard_successful'] = 'Successful applications';
en['dashboard_pending'] = 'Pending';
en['dashboard_waiting'] = 'Waiting applications';
en['dashboard_your_by_status'] = 'Your Applications by Status';

ru['dashboard_loading'] = 'Загрузка...';
ru['dashboard_wait'] = 'Пожалуйста подождите';
ru['dashboard_error_profile'] = 'Не удалось загрузить данные профиля';
ru['dashboard_error_data'] = 'Не удалось загрузить данные дашборда';
ru['dashboard_error'] = 'Произошла ошибка';
ru['dashboard_error_nodata'] = 'Не удалось загрузить данные';
ru['dashboard_retry'] = 'Повторить';
ru['dashboard_overview'] = 'Обзор';
ru['dashboard_stats_all'] = 'Общая статистика и аналитика';
ru['dashboard_stats_yours'] = 'Ваши заявки';
ru['dashboard_last_update'] = 'Последнее обновление';
ru['dashboard_refresh'] = 'Обновить';
ru['dashboard_calc_total'] = 'Запросы Калькулятора (Всего)';
ru['dashboard_last_90'] = 'Последние 90 дней';
ru['dashboard_last_7'] = 'Последние 7 Дней';
ru['dashboard_calc_usage'] = 'Использование калькулятора';
ru['dashboard_avg_monthly'] = 'Средний Ежемесячный Платёж';
ru['dashboard_server_calc'] = 'Расчёт сервера';
ru['dashboard_total_apps'] = 'Всего Заявок';
ru['dashboard_planb_apps'] = 'Заявки PlanB';
ru['dashboard_active_agents'] = 'Активные Агенты';
ru['dashboard_working_agents'] = 'Работающие агенты';
ru['dashboard_monthly_growth'] = 'Месячный Рост';
ru['dashboard_planb_growth'] = 'Рост PlanB';
ru['dashboard_conversion'] = 'Конверсия';
ru['dashboard_calc_to_app'] = 'Калькулятор → Заявка';
ru['dashboard_revenue'] = 'Прогноз Дохода';
ru['dashboard_monthly_revenue'] = 'Месячный доход';
ru['dashboard_apps_section'] = 'Заявки';
ru['dashboard_apps_by_status'] = 'Заявки по Статусу';
ru['dashboard_by_age'] = 'По Возрастным Группам';
ru['dashboard_gender_dist'] = 'Распределение по Полу';
ru['dashboard_coverage_dist'] = 'Распределение по Страховой Сумме';
ru['dashboard_daily_trend'] = 'Дневной Тренд Заявок';
ru['dashboard_agents_section'] = 'Агенты';
ru['dashboard_agent_perf'] = 'Производительность Агентов';
ru['dashboard_peak_hours'] = 'Пиковые Часы';
ru['dashboard_calc_section'] = 'Калькулятор';
ru['dashboard_calc_trend'] = 'Тренд Калькулятора (14 дней)';
ru['dashboard_by_gender'] = 'Запросы по Полу';
ru['dashboard_by_age_queries'] = 'Запросы по Возрастным Группам';
ru['dashboard_by_coverage'] = 'Запросы по Диапазонам Сумм';
ru['dashboard_most_params'] = 'Наиболее Используемые Параметры';
ru['dashboard_your_apps'] = 'Ваши Заявки';
ru['dashboard_approved'] = 'Утверждено';
ru['dashboard_successful'] = 'Успешные заявки';
ru['dashboard_pending'] = 'Ожидание';
ru['dashboard_waiting'] = 'Ожидающие заявки';
ru['dashboard_your_by_status'] = 'Ваши Заявки по Статусу';

// Admin Applications List
az['apps_badge'] = 'PlanB Müraciətlər';
az['apps_title'] = 'Müraciətlər';
az['apps_subtitle'] = 'PlanB müraciətlərinin idarə edilməsi və izlənilməsi';
az['apps_refresh'] = 'Yenilə';
az['apps_search'] = 'Axtarış';
az['apps_search_ph'] = 'Ad, email, telefon...';
az['apps_status'] = 'Status';
az['apps_all'] = 'Hamısı';
az['apps_pending'] = 'Gözləmədə';
az['apps_approved'] = 'Təsdiqlənib';
az['apps_rejected'] = 'İmtina olunub';
az['apps_start_date'] = 'Başlama tarixi';
az['apps_end_date'] = 'Bitmə tarixi';
az['apps_filters_toggle'] = 'Ətraflı filtrlər';
az['apps_reset_filters'] = 'Sıfırla';
az['apps_age_range'] = 'Yaş Aralığı';
az['apps_gender'] = 'Cinsiyyət';
az['apps_male'] = 'Kişi';
az['apps_female'] = 'Qadın';
az['apps_coverage'] = 'Sığorta Məbləği (AZN)';
az['apps_term'] = 'Müddət (il)';
az['apps_export'] = 'Çıxarış et';
az['apps_select_all'] = 'Hamısını seç';
az['apps_change_status'] = 'Status dəyiş';
az['apps_delete_selected'] = 'Seçilənləri sil';
az['apps_selected_count'] = 'seçildi';
az['apps_rejection_reason'] = 'İmtina səbəbini daxil edin';
az['apps_date'] = 'Tarix';
az['apps_full_name'] = 'Ad Soyad';
az['apps_email'] = 'Email';
az['apps_phone'] = 'Telefon';
az['apps_assign'] = 'Təyinat';
az['apps_agent_assign'] = 'Agent təyinatı';
az['apps_select_agent'] = 'Agent seç';
az['apps_age_gender'] = 'yaş';
az['apps_year'] = 'il';
az['apps_smoker_yes'] = 'Siqaret çəkir';
az['apps_smoker_no'] = 'Siqaret çəkmir';
az['apps_view_details'] = 'Ətraflı';
az['apps_reason_prefix'] = 'İmtina səbəbi';
az['apps_empty_title'] = 'Heç bir müraciət tapılmadı';
az['apps_empty_desc'] = 'Filtrləri dəyişdirin və ya yenidən cəhd edin';
az['apps_loading'] = 'Yüklənir...';

en['apps_badge'] = 'PlanB Applications';
en['apps_title'] = 'Applications';
en['apps_subtitle'] = 'Manage and track PlanB applications';
en['apps_refresh'] = 'Refresh';
en['apps_search'] = 'Search';
en['apps_search_ph'] = 'Name, email, phone...';
en['apps_status'] = 'Status';
en['apps_all'] = 'All';
en['apps_pending'] = 'Pending';
en['apps_approved'] = 'Approved';
en['apps_rejected'] = 'Rejected';
en['apps_start_date'] = 'Start date';
en['apps_end_date'] = 'End date';
en['apps_filters_toggle'] = 'Advanced filters';
en['apps_reset_filters'] = 'Reset';
en['apps_age_range'] = 'Age Range';
en['apps_gender'] = 'Gender';
en['apps_male'] = 'Male';
en['apps_female'] = 'Female';
en['apps_coverage'] = 'Coverage Amount (AZN)';
en['apps_term'] = 'Term (years)';
en['apps_export'] = 'Export';
en['apps_select_all'] = 'Select all';
en['apps_change_status'] = 'Change status';
en['apps_delete_selected'] = 'Delete selected';
en['apps_selected_count'] = 'selected';
en['apps_rejection_reason'] = 'Enter rejection reason';
en['apps_date'] = 'Date';
en['apps_full_name'] = 'Full Name';
en['apps_email'] = 'Email';
en['apps_phone'] = 'Phone';
en['apps_assign'] = 'Assignment';
en['apps_agent_assign'] = 'Agent assignment';
en['apps_select_agent'] = 'Select agent';
en['apps_age_gender'] = 'years old';
en['apps_year'] = 'years';
en['apps_smoker_yes'] = 'Smoker';
en['apps_smoker_no'] = 'Non-smoker';
en['apps_view_details'] = 'Details';
en['apps_reason_prefix'] = 'Rejection reason';
en['apps_empty_title'] = 'No applications found';
en['apps_empty_desc'] = 'Change filters or try again';
en['apps_loading'] = 'Loading...';

ru['apps_badge'] = 'Заявки PlanB';
ru['apps_title'] = 'Заявки';
ru['apps_subtitle'] = 'Управление и отслеживание заявок PlanB';
ru['apps_refresh'] = 'Обновить';
ru['apps_search'] = 'Поиск';
ru['apps_search_ph'] = 'Имя, email, телефон...';
ru['apps_status'] = 'Статус';
ru['apps_all'] = 'Все';
ru['apps_pending'] = 'Ожидание';
ru['apps_approved'] = 'Утверждено';
ru['apps_rejected'] = 'Отклонено';
ru['apps_start_date'] = 'Дата начала';
ru['apps_end_date'] = 'Дата окончания';
ru['apps_filters_toggle'] = 'Расширенные фильтры';
ru['apps_reset_filters'] = 'Сбросить';
ru['apps_age_range'] = 'Возрастной Диапазон';
ru['apps_gender'] = 'Пол';
ru['apps_male'] = 'Мужской';
ru['apps_female'] = 'Женский';
ru['apps_coverage'] = 'Страховая Сумма (AZN)';
ru['apps_term'] = 'Срок (лет)';
ru['apps_export'] = 'Экспорт';
ru['apps_select_all'] = 'Выбрать все';
ru['apps_change_status'] = 'Изменить статус';
ru['apps_delete_selected'] = 'Удалить выбранные';
ru['apps_selected_count'] = 'выбрано';
ru['apps_rejection_reason'] = 'Введите причину отклонения';
ru['apps_date'] = 'Дата';
ru['apps_full_name'] = 'ФИО';
ru['apps_email'] = 'Email';
ru['apps_phone'] = 'Телефон';
ru['apps_assign'] = 'Назначение';
ru['apps_agent_assign'] = 'Назначение агента';
ru['apps_select_agent'] = 'Выберите агента';
ru['apps_age_gender'] = 'лет';
ru['apps_year'] = 'лет';
ru['apps_smoker_yes'] = 'Курящий';
ru['apps_smoker_no'] = 'Некурящий';
ru['apps_view_details'] = 'Подробнее';
ru['apps_reason_prefix'] = 'Причина отклонения';
ru['apps_empty_title'] = 'Заявки не найдены';
ru['apps_empty_desc'] = 'Измените фильтры или попробуйте снова';
ru['apps_loading'] = 'Загрузка...';

// Admin Messaging
az['msg_loading'] = 'Yüklənir...';
az['msg_loading_desc'] = 'Mesajlaşdırma paneli hazırlanır';
az['msg_no_access'] = 'Giriş icazəsi yoxdur';
az['msg_title'] = 'Mesaj Göndər';
az['msg_label'] = 'Mesaj';
az['msg_placeholder'] = 'Mesaj mətni...';
az['msg_sending'] = 'Göndərilir...';
az['msg_send_slack'] = 'Slack-a göndər';
az['msg_send_tg_channel'] = 'Telegram kanalına göndər';
az['msg_send_tg_agents'] = 'Seçilən agentlərə Telegram';
az['msg_send_email'] = 'Seçilən agentlərə Email';
az['msg_selected'] = 'Seçilən';
az['msg_success_slack'] = 'Mesaj(lar) uğurla göndərildi';
az['msg_success_tg'] = 'Telegram kanalına göndərildi';
az['msg_success_tg_agents'] = 'Agentlərin Telegram-ına göndərildi';
az['msg_success_email'] = 'Agentlərə email göndərildi';
az['msg_error'] = 'Göndərmə alınmadı';

en['msg_loading'] = 'Loading...';
en['msg_loading_desc'] = 'Preparing messaging panel';
en['msg_no_access'] = 'Access denied';
en['msg_title'] = 'Send Message';
en['msg_label'] = 'Message';
en['msg_placeholder'] = 'Message text...';
en['msg_sending'] = 'Sending...';
en['msg_send_slack'] = 'Send to Slack';
en['msg_send_tg_channel'] = 'Send to Telegram channel';
en['msg_send_tg_agents'] = 'Telegram to selected agents';
en['msg_send_email'] = 'Email to selected agents';
en['msg_selected'] = 'Selected';
en['msg_success_slack'] = 'Message(s) sent successfully';
en['msg_success_tg'] = 'Sent to Telegram channel';
en['msg_success_tg_agents'] = 'Sent to agents Telegram';
en['msg_success_email'] = 'Email sent to agents';
en['msg_error'] = 'Send failed';

ru['msg_loading'] = 'Загрузка...';
ru['msg_loading_desc'] = 'Подготовка панели сообщений';
ru['msg_no_access'] = 'Доступ запрещен';
ru['msg_title'] = 'Отправить Сообщение';
ru['msg_label'] = 'Сообщение';
ru['msg_placeholder'] = 'Текст сообщения...';
ru['msg_sending'] = 'Отправка...';
ru['msg_send_slack'] = 'Отправить в Slack';
ru['msg_send_tg_channel'] = 'Отправить в Telegram канал';
ru['msg_send_tg_agents'] = 'Telegram выбранным агентам';
ru['msg_send_email'] = 'Email выбранным агентам';
ru['msg_selected'] = 'Выбрано';
ru['msg_success_slack'] = 'Сообщение(я) успешно отправлено';
ru['msg_success_tg'] = 'Отправлено в Telegram канал';
ru['msg_success_tg_agents'] = 'Отправлено в Telegram агентов';
ru['msg_success_email'] = 'Email отправлен агентам';
ru['msg_error'] = 'Ошибка отправки';

// Admin Agents
az['agents_badge'] = 'PlanB Agentlər';
az['agents_title'] = 'Agentlər';
az['agents_subtitle'] = 'PlanB agentlərinin idarə edilməsi və izlənilməsi';
az['agents_total'] = 'Ümumi agent';
az['agents_refresh'] = 'Yenilə';
az['agents_no_access'] = 'Giriş İcazəsi Yoxdur';
az['agents_no_access_desc'] = 'Bu səhifəyə giriş icazəniz yoxdur. Yalnız superadmin istifadəçiləri agentləri idarə edə bilər.';
az['agents_back'] = 'Geri qayıt';
az['agents_add_title'] = 'Yeni Agent Əlavə Et';
az['agents_add_desc'] = 'PlanB komandasına yeni agent əlavə edin';
az['agents_full_name'] = 'Ad Soyad';
az['agents_email'] = 'Email';
az['agents_phone'] = 'Telefon';
az['agents_chat_id'] = 'Telegram Chat ID';
az['agents_create'] = 'Agent Yarat';
az['agents_creating'] = 'Yaradılır...';
az['agents_list_title'] = 'Agent Siyahısı';
az['agents_role'] = 'Rol';
az['agents_status'] = 'Status';
az['agents_actions'] = 'Əməliyyatlar';
az['agents_delete'] = 'Sil';
az['agents_empty'] = 'Heç bir agent tapılmadı';

en['agents_badge'] = 'PlanB Agents';
en['agents_title'] = 'Agents';
en['agents_subtitle'] = 'Manage and track PlanB agents';
en['agents_total'] = 'Total agents';
en['agents_refresh'] = 'Refresh';
en['agents_no_access'] = 'Access Denied';
en['agents_no_access_desc'] = 'You do not have access to this page. Only superadmin users can manage agents.';
en['agents_back'] = 'Go back';
en['agents_add_title'] = 'Add New Agent';
en['agents_add_desc'] = 'Add a new agent to the PlanB team';
en['agents_full_name'] = 'Full Name';
en['agents_email'] = 'Email';
en['agents_phone'] = 'Phone';
en['agents_chat_id'] = 'Telegram Chat ID';
en['agents_create'] = 'Create Agent';
en['agents_creating'] = 'Creating...';
en['agents_list_title'] = 'Agent List';
en['agents_role'] = 'Role';
en['agents_status'] = 'Status';
en['agents_actions'] = 'Actions';
en['agents_delete'] = 'Delete';
en['agents_empty'] = 'No agents found';

ru['agents_badge'] = 'Агенты PlanB';
ru['agents_title'] = 'Агенты';
ru['agents_subtitle'] = 'Управление и отслеживание агентов PlanB';
ru['agents_total'] = 'Всего агентов';
ru['agents_refresh'] = 'Обновить';
ru['agents_no_access'] = 'Доступ Запрещен';
ru['agents_no_access_desc'] = 'У вас нет доступа к этой странице. Только суперадминистраторы могут управлять агентами.';
ru['agents_back'] = 'Назад';
ru['agents_add_title'] = 'Добавить Нового Агента';
ru['agents_add_desc'] = 'Добавьте нового агента в команду PlanB';
ru['agents_full_name'] = 'ФИО';
ru['agents_email'] = 'Email';
ru['agents_phone'] = 'Телефон';
ru['agents_chat_id'] = 'Telegram Chat ID';
ru['agents_create'] = 'Создать Агента';
ru['agents_creating'] = 'Создание...';
ru['agents_list_title'] = 'Список Агентов';
ru['agents_role'] = 'Роль';
ru['agents_status'] = 'Статус';
ru['agents_actions'] = 'Действия';
ru['agents_delete'] = 'Удалить';
ru['agents_empty'] = 'Агенты не найдены';

// Admin Calculator Settings  
az['calc_settings_title'] = 'Kalkulyator Parametrləri';
az['calc_settings_subtitle'] = 'Kalkulyator hesablama parametrlərini idarə edin';
az['calc_settings_active'] = 'Aktiv konfiqurasiya';
az['calc_settings_save'] = 'Yadda saxla';
az['calc_settings_calculation'] = 'Hesablama Qaydası';
az['calc_settings_base_rate'] = 'Hər 10,000 AZN üçün aylıq tarif';
az['calc_settings_base_rate_desc'] = 'Bu məbləğ hər 10,000 AZN sığorta məbləği üçün aylıq ödənişdir';
az['calc_settings_age_factors'] = 'Yaş Əmsalları';
az['calc_settings_gender_factors'] = 'Cins Əmsalları';
az['calc_settings_male_factor'] = 'Kişi əmsalı';
az['calc_settings_female_factor'] = 'Qadın əmsalı';
az['calc_settings_smoker_factor'] = 'Siqaret Çəkmə Əmsalı';
az['calc_settings_term_factors'] = 'Müddət Əmsalları';
az['calc_settings_base_tariff'] = 'Əsas Tarif';
az['calc_settings_min_age'] = 'Min yaş';
az['calc_settings_max_age'] = 'Max yaş';
az['calc_settings_factor'] = 'Əmsal';
az['calc_settings_term'] = 'Müddət (il)';
az['calc_settings_male_desc'] = 'Kişi müştərilər üçün əmsal';
az['calc_settings_female_desc'] = 'Qadın müştərilər üçün əmsal';
az['calc_settings_smoker_desc'] = 'Siqaret çəkən müştərilər üçün əlavə əmsal';
az['calc_settings_smoker_label'] = 'Siqaret çəkənlər üçün əmsal';
az['calc_settings_formula'] = 'Aylıq Ödəniş = Əsas Tarif × (Sığorta Məbləği ÷ 10,000) × Yaş Əmsalı × Cins Əmsalı × Müddət Əmsalı × Siqaret Əmsalı';
az['calc_settings_factor_1'] = 'Əmsal 1.0';
az['calc_settings_factor_1_desc'] = 'Qiymət dəyişmir (100%)';
az['calc_settings_factor_15'] = 'Əmsal 1.5';
az['calc_settings_factor_15_desc'] = 'Qiymət 50% artır (150%)';
az['calc_settings_factor_08'] = 'Əmsal 0.8';
az['calc_settings_factor_08_desc'] = 'Qiymət 20% azalır (80%)';
az['calc_settings_add_age'] = 'Yaş əlavə et';
az['calc_settings_add_term'] = 'Müddət əlavə et';
az['calc_settings_remove'] = 'Sil';
az['calc_settings_add'] = 'Əlavə et';
az['calc_settings_delete'] = 'Sil';
az['calc_settings_refresh'] = 'Yenilə';
az['calc_settings_create_default'] = 'Default Yarat';
az['calc_settings_saving'] = 'Yadda saxlanılır...';
az['calc_settings_update'] = 'Qaydaları yenilə';
az['calc_settings_back'] = 'Geri qayıt';
az['calc_settings_success'] = 'Kalkulyator qaydaları yeniləndi';
az['calc_settings_default_desc'] = 'İlk default konfiqurasiya';
az['calc_settings_admin_update'] = 'Admin tərəfindən yeniləndi';
az['calc_settings_no_access_desc'] = 'Bu səhifəyə giriş icazəniz yoxdur. Yalnız superadmin istifadəçiləri kalkulyator tənzimlərini idarə edə bilər.';

en['calc_settings_title'] = 'Calculator Settings';
en['calc_settings_subtitle'] = 'Manage calculator parameters';
en['calc_settings_active'] = 'Active configuration';
en['calc_settings_save'] = 'Save';
en['calc_settings_calculation'] = 'Calculation Rule';
en['calc_settings_base_rate'] = 'Monthly rate per 10,000 AZN';
en['calc_settings_base_rate_desc'] = 'This amount is the monthly payment for every 10,000 AZN coverage';
en['calc_settings_age_factors'] = 'Age Factors';
en['calc_settings_gender_factors'] = 'Gender Factors';
en['calc_settings_male_factor'] = 'Male factor';
en['calc_settings_female_factor'] = 'Female factor';
en['calc_settings_smoker_factor'] = 'Smoking Factor';
en['calc_settings_term_factors'] = 'Term Factors';
en['calc_settings_base_tariff'] = 'Base Tariff';
en['calc_settings_min_age'] = 'Min age';
en['calc_settings_max_age'] = 'Max age';
en['calc_settings_factor'] = 'Factor';
en['calc_settings_term'] = 'Term (years)';
en['calc_settings_male_desc'] = 'Factor for male customers';
en['calc_settings_female_desc'] = 'Factor for female customers';
en['calc_settings_smoker_desc'] = 'Additional factor for smoking customers';
en['calc_settings_smoker_label'] = 'Factor for smokers';
en['calc_settings_formula'] = 'Monthly Payment = Base Rate × (Coverage ÷ 10,000) × Age Factor × Gender Factor × Term Factor × Smoking Factor';
en['calc_settings_factor_1'] = 'Factor 1.0';
en['calc_settings_factor_1_desc'] = 'Price unchanged (100%)';
en['calc_settings_factor_15'] = 'Factor 1.5';
en['calc_settings_factor_15_desc'] = 'Price increases 50% (150%)';
en['calc_settings_factor_08'] = 'Factor 0.8';
en['calc_settings_factor_08_desc'] = 'Price decreases 20% (80%)';
en['calc_settings_add_age'] = 'Add age';
en['calc_settings_add_term'] = 'Add term';
en['calc_settings_remove'] = 'Remove';
en['calc_settings_add'] = 'Add';
en['calc_settings_delete'] = 'Delete';
en['calc_settings_refresh'] = 'Refresh';
en['calc_settings_create_default'] = 'Create Default';
en['calc_settings_saving'] = 'Saving...';
en['calc_settings_update'] = 'Update Rules';
en['calc_settings_back'] = 'Go Back';
en['calc_settings_success'] = 'Calculator rules updated';
en['calc_settings_default_desc'] = 'Initial default configuration';
en['calc_settings_admin_update'] = 'Updated by admin';
en['calc_settings_no_access_desc'] = 'You do not have access to this page. Only superadmin users can manage calculator settings.';

ru['calc_settings_title'] = 'Настройки Калькулятора';
ru['calc_settings_subtitle'] = 'Управление параметрами калькулятора';
ru['calc_settings_active'] = 'Активная конфигурация';
ru['calc_settings_save'] = 'Сохранить';
ru['calc_settings_calculation'] = 'Правило Расчета';
ru['calc_settings_base_rate'] = 'Месячная ставка на 10,000 AZN';
ru['calc_settings_base_rate_desc'] = 'Эта сумма - месячный платёж за каждые 10,000 AZN покрытия';
ru['calc_settings_age_factors'] = 'Возрастные Коэффициенты';
ru['calc_settings_gender_factors'] = 'Половые Коэффициенты';
ru['calc_settings_male_factor'] = 'Коэффициент для мужчин';
ru['calc_settings_female_factor'] = 'Коэффициент для женщин';
ru['calc_settings_smoker_factor'] = 'Коэффициент Курения';
ru['calc_settings_term_factors'] = 'Коэффициенты Срока';
ru['calc_settings_base_tariff'] = 'Базовый Тариф';
ru['calc_settings_min_age'] = 'Мин возраст';
ru['calc_settings_max_age'] = 'Макс возраст';
ru['calc_settings_factor'] = 'Коэффициент';
ru['calc_settings_term'] = 'Срок (лет)';
ru['calc_settings_male_desc'] = 'Коэффициент для мужчин';
ru['calc_settings_female_desc'] = 'Коэффициент для женщин';
ru['calc_settings_smoker_desc'] = 'Дополнительный коэффициент для курящих';
ru['calc_settings_smoker_label'] = 'Коэффициент для курящих';
ru['calc_settings_formula'] = 'Месячный Платёж = Базовая Ставка × (Сумма ÷ 10,000) × Коэф. Возраста × Коэф. Пола × Коэф. Срока × Коэф. Курения';
ru['calc_settings_factor_1'] = 'Коэффициент 1.0';
ru['calc_settings_factor_1_desc'] = 'Цена не меняется (100%)';
ru['calc_settings_factor_15'] = 'Коэффициент 1.5';
ru['calc_settings_factor_15_desc'] = 'Цена увеличивается на 50% (150%)';
ru['calc_settings_factor_08'] = 'Коэффициент 0.8';
ru['calc_settings_factor_08_desc'] = 'Цена уменьшается на 20% (80%)';
ru['calc_settings_add_age'] = 'Добавить возраст';
ru['calc_settings_add_term'] = 'Добавить срок';
ru['calc_settings_remove'] = 'Удалить';
ru['calc_settings_add'] = 'Добавить';
ru['calc_settings_delete'] = 'Удалить';
ru['calc_settings_refresh'] = 'Обновить';
ru['calc_settings_create_default'] = 'Создать По Умолчанию';
ru['calc_settings_saving'] = 'Сохранение...';
ru['calc_settings_update'] = 'Обновить Правила';
ru['calc_settings_back'] = 'Назад';
ru['calc_settings_success'] = 'Правила калькулятора обновлены';
ru['calc_settings_default_desc'] = 'Начальная конфигурация по умолчанию';
ru['calc_settings_admin_update'] = 'Обновлено администратором';
ru['calc_settings_no_access_desc'] = 'У вас нет доступа к этой странице. Только суперадминистраторы могут управлять настройками калькулятора.';

// Admin Settings
az['settings_title'] = 'Parametrlər';
az['settings_subtitle'] = 'Hesab parametrlərini idarə edin';
az['settings_email'] = 'Email ünvanı';
az['settings_telegram'] = 'Telegram Chat ID';
az['settings_telegram_desc'] = 'Telegram bildirişləri almaq üçün';
az['settings_password'] = 'Şifrə';
az['settings_current_password'] = 'Cari şifrə';
az['settings_new_password'] = 'Yeni şifrə';
az['settings_confirm_password'] = 'Şifrəni təsdiqlə';
az['settings_update'] = 'Yenilə';
az['settings_updating'] = 'Yenilənir...';

en['settings_title'] = 'Settings';
en['settings_subtitle'] = 'Manage account settings';
en['settings_email'] = 'Email address';
en['settings_telegram'] = 'Telegram Chat ID';
en['settings_telegram_desc'] = 'For receiving Telegram notifications';
en['settings_password'] = 'Password';
en['settings_current_password'] = 'Current password';
en['settings_new_password'] = 'New password';
en['settings_confirm_password'] = 'Confirm password';
en['settings_update'] = 'Update';
en['settings_updating'] = 'Updating...';

ru['settings_title'] = 'Настройки';
ru['settings_subtitle'] = 'Управление настройками аккаунта';
ru['settings_email'] = 'Email адрес';
ru['settings_telegram'] = 'Telegram Chat ID';
ru['settings_telegram_desc'] = 'Для получения Telegram уведомлений';
ru['settings_password'] = 'Пароль';
ru['settings_current_password'] = 'Текущий пароль';
ru['settings_new_password'] = 'Новый пароль';
ru['settings_confirm_password'] = 'Подтвердите пароль';
ru['settings_update'] = 'Обновить';
ru['settings_updating'] = 'Обновление...';

export const dictionaries: Record<SupportedLocale, Dictionary> = { az, en, ru };


