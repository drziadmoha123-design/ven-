import os

html = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ven+ | Interactive Prototype</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        ven: {
                            900: '#111827',
                            800: '#1f2937',
                            700: '#374151',
                            primary: '#8b5cf6',
                            primaryDark: '#7c3aed',
                            accent: '#c084fc',
                        }
                    },
                    fontFamily: {
                        sans: ['"Tajawal"', 'sans-serif'],
                    }
                }
            }
        }
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { background-color: #0f172a; color: #f8fafc; font-family: 'Tajawal', sans-serif; overflow-x: hidden; }
        .glass { background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
        .glass-card { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 1rem; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .view { display: none; animation: fadeIn 0.3s ease-out; }
        .view.active { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        #toast-container { position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); z-index: 1000; display: flex; flex-direction: column; gap: 10px; }
        .toast { background: #8b5cf6; color: white; padding: 12px 24px; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5); animation: slideUp 0.3s forwards; font-weight: 500; display: flex; align-items: center; gap: 8px;}
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 10px 25px -5px rgba(139, 92, 246, 0.15); }
        .pb-safe { padding-bottom: calc(env(safe-area-inset-bottom) + 10px); }
    </style>
</head>
<body class="antialiased pb-20 md:pb-0">
    <!-- Demo Navigation Bar -->
    <div class="fixed top-0 left-0 w-full bg-slate-900 border-b border-ven-primary/30 z-[100] py-2 px-4 flex gap-3 overflow-x-auto hide-scrollbar text-xs font-mono shadow-lg" style="direction: ltr;">
        <span class="text-ven-accent font-bold mt-1 tracking-wider uppercase">Demo Prototype</span>
        <button onclick="navigate('home')" class="bg-slate-800 border border-slate-600 px-3 py-1 rounded hover:bg-slate-700 whitespace-nowrap transition">Home</button>
        <button onclick="navigate('product-details')" class="bg-slate-800 border border-slate-600 px-3 py-1 rounded hover:bg-slate-700 whitespace-nowrap transition">Product</button>
        <button onclick="navigate('cart')" class="bg-slate-800 border border-slate-600 px-3 py-1 rounded hover:bg-slate-700 whitespace-nowrap transition">Cart <span id="demo-cart-count" class="text-ven-accent">(0)</span></button>
        <button onclick="navigate('checkout')" class="bg-slate-800 border border-slate-600 px-3 py-1 rounded hover:bg-slate-700 whitespace-nowrap transition">Checkout</button>
        <button onclick="navigate('tracking')" class="bg-slate-800 border border-slate-600 px-3 py-1 rounded hover:bg-slate-700 whitespace-nowrap transition">Tracking</button>
        <button onclick="navigate('account')" class="bg-slate-800 border border-slate-600 px-3 py-1 rounded hover:bg-slate-700 whitespace-nowrap transition">Account</button>
        <button onclick="navigate('admin')" class="bg-rose-900 border border-rose-700 text-rose-100 px-3 py-1 rounded hover:bg-rose-800 whitespace-nowrap transition ml-auto">Admin Dashboard</button>
    </div>

    <!-- Main Header -->
    <header class="glass fixed top-[45px] left-0 w-full z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div class="flex items-center gap-8">
                <div class="text-3xl font-extrabold text-white tracking-tighter cursor-pointer" onclick="navigate('home')">
                    Ven<span class="text-ven-primary">+</span>
                </div>
                <nav class="hidden md:flex gap-6">
                    <a href="#" onclick="navigate('home')" class="text-sm font-medium text-slate-200 hover:text-ven-accent transition">الرئيسية</a>
                    <a href="#" class="text-sm font-medium text-slate-400 hover:text-slate-200 transition">الإلكترونيات</a>
                    <a href="#" class="text-sm font-medium text-slate-400 hover:text-slate-200 transition">الموضة</a>
                    <a href="#" class="text-sm font-medium text-slate-400 hover:text-slate-200 transition">العروض</a>
                </nav>
            </div>
            <div class="flex items-center gap-4">
                <div class="hidden md:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/50 cursor-pointer" onclick="navigate('account')">
                    <i class="fas fa-star text-yellow-400 text-sm drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"></i>
                    <span class="text-sm font-bold text-yellow-50" id="header-points">0</span>
                </div>
                <div class="relative w-full max-w-xs hidden lg:block">
                    <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                    <input type="text" placeholder="ابحث عن منتجات..." class="w-full bg-slate-800/50 border border-slate-700 rounded-full py-2 pr-9 pl-4 text-sm focus:outline-none focus:border-ven-primary focus:ring-1 focus:ring-ven-primary transition">
                </div>
                <button onclick="navigate('cart')" class="relative p-2 text-slate-300 hover:text-ven-primary transition">
                    <i class="fas fa-shopping-cart text-lg"></i>
                    <span class="absolute top-0 right-0 bg-ven-primary text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold" id="desktop-cart-badge">0</span>
                </button>
                <button onclick="navigate('account')" class="hidden md:block p-2 text-slate-300 hover:text-ven-primary transition">
                    <i class="fas fa-user-circle text-xl"></i>
                </button>
            </div>
        </div>
    </header>

    <!-- Main Content Container -->
    <main class="pt-[130px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
        
        <!-- View: Home -->
        <div id="view-home" class="view active">
            <!-- Hero -->
            <div class="relative rounded-2xl overflow-hidden bg-gradient-to-r from-ven-900 to-slate-900 border border-slate-800 mb-12">
                <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
                <div class="absolute inset-0 bg-gradient-to-l from-slate-900 via-slate-900/80 to-transparent"></div>
                <div class="relative z-10 p-8 md:p-16 w-full md:w-2/3">
                    <span class="bg-ven-primary/20 text-ven-accent px-3 py-1 rounded-full text-xs font-bold mb-4 inline-block border border-ven-primary/30">وصول جديد</span>
                    <h1 class="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">استكشف الجيل الجديد <br> من التقنية</h1>
                    <p class="text-slate-400 mb-8 max-w-md text-lg">احصل على أحدث الأجهزة الذكية وادفع باستخدام نقاطك التي جمعتها. تجربة تسوق لا مثيل لها.</p>
                    <button class="bg-ven-primary hover:bg-ven-primaryDark text-white px-8 py-3 rounded-full font-bold transition shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]">تسوّق الآن</button>
                </div>
            </div>

            <!-- Categories -->
            <div class="flex gap-4 overflow-x-auto hide-scrollbar mb-12 pb-2">
                <button class="px-6 py-2 rounded-full bg-ven-primary text-white font-medium whitespace-nowrap">الكل</button>
                <button class="px-6 py-2 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium whitespace-nowrap transition border border-slate-700">إلكترونيات</button>
                <button class="px-6 py-2 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium whitespace-nowrap transition border border-slate-700">موضة</button>
                <button class="px-6 py-2 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium whitespace-nowrap transition border border-slate-700">المنزل الذكي</button>
                <button class="px-6 py-2 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium whitespace-nowrap transition border border-slate-700">ألعاب</button>
            </div>

            <!-- Products Grid -->
            <div class="flex justify-between items-end mb-6">
                <h2 class="text-2xl font-bold">المنتجات المميزة</h2>
                <a href="#" class="text-ven-accent text-sm hover:underline">عرض الكل <i class="fas fa-arrow-left ml-1 text-xs"></i></a>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6" id="products-grid">
                <!-- Injected via JS -->
            </div>
        </div>

        <!-- View: Product Details -->
        <div id="view-product-details" class="view">
            <button onclick="navigate('home')" class="text-slate-400 hover:text-white mb-6 flex items-center gap-2 transition">
                <i class="fas fa-arrow-right"></i> عودة للمتجر
            </button>
            <div class="glass-card p-6 md:p-8" id="product-details-container">
                <!-- Injected via JS -->
            </div>
        </div>

        <!-- View: Cart -->
        <div id="view-cart" class="view max-w-4xl mx-auto">
            <h2 class="text-3xl font-bold mb-8">سلة المشتريات</h2>
            <div class="flex flex-col lg:flex-row gap-8">
                <div class="flex-grow" id="cart-items-container">
                    <!-- Injected via JS -->
                </div>
                <div class="w-full lg:w-96 shrink-0">
                    <div class="glass-card p-6 sticky top-32">
                        <h3 class="text-xl font-bold mb-4">ملخص الطلب</h3>
                        <div class="space-y-3 mb-6 text-sm text-slate-300">
                            <div class="flex justify-between"><span>المجموع الفرعي</span><span id="cart-subtotal" class="font-medium text-white">0 رس</span></div>
                            <div class="flex justify-between"><span>الضريبة (15%)</span><span id="cart-tax" class="font-medium text-white">0 رس</span></div>
                            <div class="flex justify-between"><span>الشحن</span><span class="text-green-400 font-medium">مجاني</span></div>
                            <div class="border-t border-slate-700 pt-3 mt-3 flex justify-between items-center">
                                <span class="font-bold text-white text-base">الإجمالي</span>
                                <span id="cart-total" class="font-bold text-xl text-ven-primary">0 رس</span>
                            </div>
                            <div class="bg-slate-800/50 p-3 rounded-lg border border-slate-700 mt-4 flex items-start gap-3">
                                <i class="fas fa-star text-yellow-400 mt-1"></i>
                                <div>
                                    <p class="text-xs text-slate-400 mb-1">أو ادفع باستخدام النقاط</p>
                                    <p class="font-bold text-yellow-400" id="cart-points-total">0 نقطة</p>
                                </div>
                            </div>
                        </div>
                        <button onclick="navigate('checkout')" class="w-full bg-ven-primary hover:bg-ven-primaryDark text-white py-3 rounded-lg font-bold transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" id="checkout-btn">متابعة الدفع</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- View: Checkout -->
        <div id="view-checkout" class="view max-w-4xl mx-auto">
            <button onclick="navigate('cart')" class="text-slate-400 hover:text-white mb-6 flex items-center gap-2 transition">
                <i class="fas fa-arrow-right"></i> عودة للسلة
            </button>
            <h2 class="text-3xl font-bold mb-8">إتمام الطلب</h2>
            <div class="flex flex-col lg:flex-row gap-8">
                <div class="flex-grow space-y-6">
                    <!-- Shipping -->
                    <div class="glass-card p-6">
                        <h3 class="text-xl font-bold mb-4 flex items-center gap-2"><i class="fas fa-map-marker-alt text-ven-accent"></i> عنوان التوصيل</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label class="block text-xs text-slate-400 mb-1">الاسم الكامل</label><input type="text" value="أحمد محمد" class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-ven-primary focus:outline-none"></div>
                            <div><label class="block text-xs text-slate-400 mb-1">رقم الجوال</label><input type="text" value="0501234567" class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-ven-primary focus:outline-none text-left" dir="ltr"></div>
                            <div class="md:col-span-2"><label class="block text-xs text-slate-400 mb-1">العنوان التفصيلي</label><input type="text" value="الرياض، حي الملقا، شارع الأنس، مبنى 12" class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-ven-primary focus:outline-none"></div>
                        </div>
                    </div>
                    
                    <!-- Payment Method -->
                    <div class="glass-card p-6">
                        <h3 class="text-xl font-bold mb-4 flex items-center gap-2"><i class="fas fa-credit-card text-ven-accent"></i> طريقة الدفع</h3>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label class="cursor-pointer border-2 border-ven-primary bg-ven-primary/10 rounded-xl p-4 flex items-center gap-4 transition hover:bg-ven-primary/20" id="pay-cash-label">
                                <input type="radio" name="payment_method" value="CASH" checked class="accent-ven-primary w-5 h-5" onchange="updateCheckoutMethod()">
                                <div>
                                    <div class="font-bold">البطاقة الائتمانية / مدى</div>
                                    <div class="text-xs text-slate-400 mt-1" id="checkout-cash-amount">0 رس</div>
                                </div>
                            </label>
                            <label class="cursor-pointer border-2 border-slate-700 bg-slate-800/50 rounded-xl p-4 flex items-center gap-4 transition hover:bg-slate-700/50" id="pay-points-label">
                                <input type="radio" name="payment_method" value="POINTS" class="accent-ven-primary w-5 h-5" onchange="updateCheckoutMethod()">
                                <div>
                                    <div class="font-bold flex items-center gap-1">الدفع بالنقاط <i class="fas fa-star text-yellow-400 text-xs"></i></div>
                                    <div class="text-xs text-yellow-400/80 mt-1" id="checkout-points-amount">0 نقطة</div>
                                    <div class="text-[10px] text-slate-500 mt-1">رصيدك: <span id="checkout-user-points">0</span></div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Referral -->
                    <div class="glass-card p-6">
                        <h3 class="text-xl font-bold mb-4 flex items-center gap-2"><i class="fas fa-user-friends text-ven-accent"></i> كود الإحالة (Referral)</h3>
                        <p class="text-sm text-slate-400 mb-3">إذا كان لديك كود إحالة من صديق، أدخله هنا لتحصل على مكافأة.</p>
                        <div class="flex gap-2">
                            <input type="text" id="referral-input" placeholder="أدخل الكود هنا (مثال: VEN-XYZ)" class="flex-grow bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm uppercase focus:border-ven-primary focus:outline-none text-left" dir="ltr">
                            <button onclick="applyReferral()" class="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap">تطبيق</button>
                        </div>
                        <div id="referral-msg" class="text-xs mt-2 text-green-400 hidden"><i class="fas fa-check-circle mr-1"></i> تم تفعيل كود الإحالة بنجاح! سيتم إضافة النقاط بعد إتمام الطلب.</div>
                    </div>
                </div>

                <!-- Summary Sidebar -->
                <div class="w-full lg:w-96 shrink-0">
                    <div class="glass-card p-6 sticky top-32">
                        <h3 class="text-xl font-bold mb-4">ملخص نهائي</h3>
                        <div class="space-y-4 mb-6">
                            <div class="bg-slate-800/50 p-3 rounded-lg flex items-center gap-3">
                                <div class="bg-ven-primary/20 p-2 rounded text-ven-accent"><i class="fas fa-box-open"></i></div>
                                <div><div class="text-xs text-slate-400">عدد المنتجات</div><div class="font-bold" id="checkout-item-count">0</div></div>
                            </div>
                            <div class="border-t border-slate-700 pt-4 flex justify-between items-center">
                                <span class="font-bold text-white text-lg">الإجمالي المطلوب</span>
                                <span id="checkout-final-total" class="font-bold text-2xl text-ven-primary">0 رس</span>
                            </div>
                        </div>
                        <button onclick="placeOrder()" class="w-full bg-ven-primary hover:bg-ven-primaryDark text-white py-3.5 rounded-lg font-bold transition shadow-lg flex justify-center items-center gap-2">
                            <i class="fas fa-lock text-sm"></i> تأكيد ودفع الطلب
                        </button>
                        <p class="text-center text-[10px] text-slate-500 mt-3"><i class="fas fa-shield-alt"></i> عملية دفع آمنة ومشفرة</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- View: Order Tracking -->
        <div id="view-tracking" class="view max-w-3xl mx-auto text-center">
            <div class="glass-card p-8 md:p-12">
                <div class="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-check text-4xl"></i>
                </div>
                <h2 class="text-3xl font-bold mb-2">تم تأكيد طلبك بنجاح!</h2>
                <p class="text-slate-400 mb-8">رقم الطلب: <span class="text-ven-accent font-mono" id="tracking-order-id">#ORD-000</span></p>

                <div class="relative max-w-lg mx-auto text-right">
                    <div class="absolute right-4 top-2 bottom-2 w-0.5 bg-slate-700"></div>
                    
                    <div class="relative pr-10 mb-8">
                        <div class="absolute right-[0.4rem] top-1 w-5 h-5 bg-ven-primary rounded-full border-4 border-slate-900 z-10 shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
                        <h4 class="font-bold text-white mb-1">تم الاستلام</h4>
                        <p class="text-xs text-slate-400">لقد استلمنا طلبك بنجاح.</p>
                    </div>
                    
                    <div class="relative pr-10 mb-8 opacity-50">
                        <div class="absolute right-[0.4rem] top-1 w-5 h-5 bg-slate-600 rounded-full border-4 border-slate-900 z-10"></div>
                        <h4 class="font-bold text-white mb-1">قيد التجهيز</h4>
                        <p class="text-xs text-slate-400">يتم الآن تجهيز منتجاتك.</p>
                    </div>

                    <div class="relative pr-10 mb-8 opacity-50">
                        <div class="absolute right-[0.4rem] top-1 w-5 h-5 bg-slate-600 rounded-full border-4 border-slate-900 z-10"></div>
                        <h4 class="font-bold text-white mb-1">تم الشحن</h4>
                        <p class="text-xs text-slate-400">الطلب في طريقه إليك.</p>
                    </div>

                    <div class="relative pr-10 opacity-50">
                        <div class="absolute right-[0.4rem] top-1 w-5 h-5 bg-slate-600 rounded-full border-4 border-slate-900 z-10"></div>
                        <h4 class="font-bold text-white mb-1">تم التوصيل</h4>
                        <p class="text-xs text-slate-400">وصل الطلب إلى عنوانك.</p>
                    </div>
                </div>

                <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                    <button onclick="navigate('home')" class="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white px-6 py-2.5 rounded-lg font-medium transition">مواصلة التسوق</button>
                    <button onclick="navigate('account')" class="bg-ven-primary hover:bg-ven-primaryDark text-white px-6 py-2.5 rounded-lg font-medium transition">حسابي</button>
                </div>
            </div>
        </div>

        <!-- View: Account -->
        <div id="view-account" class="view max-w-5xl mx-auto">
            <h2 class="text-3xl font-bold mb-8">حسابي</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Profile & Points -->
                <div class="md:col-span-1 space-y-6">
                    <div class="glass-card p-6 text-center">
                        <div class="w-24 h-24 bg-gradient-to-tr from-ven-primary to-ven-accent rounded-full mx-auto mb-4 p-1">
                            <div class="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-3xl font-bold text-white">أم</div>
                        </div>
                        <h3 class="text-xl font-bold mb-1" id="account-name">أحمد محمد</h3>
                        <p class="text-slate-400 text-sm mb-6">ahmed@example.com</p>
                        
                        <div class="bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 relative overflow-hidden">
                            <i class="fas fa-star absolute -left-2 -bottom-2 text-6xl text-yellow-500/10"></i>
                            <div class="text-sm text-yellow-200/80 mb-1">رصيد النقاط (Ven+ Points)</div>
                            <div class="text-3xl font-extrabold text-yellow-400" id="account-points">0</div>
                        </div>
                    </div>

                    <div class="glass-card p-6 border-ven-primary/30 relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-ven-primary/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <h3 class="text-lg font-bold mb-2 flex items-center gap-2"><i class="fas fa-gift text-ven-accent"></i> شارك واكسب</h3>
                        <p class="text-xs text-slate-400 mb-4 leading-relaxed">شارك كود الإحالة الخاص بك مع أصدقائك. سيحصل صديقك على خصم، وتحصل أنت على <strong class="text-yellow-400">1000 نقطة</strong> عند أول عملية شراء له!</p>
                        <div class="bg-slate-900 border border-slate-700 rounded-lg p-3 flex justify-between items-center cursor-pointer hover:border-ven-primary transition" onclick="copyReferral()">
                            <span class="font-mono text-ven-accent tracking-wider font-bold" id="account-referral">VEN-XXX</span>
                            <i class="fas fa-copy text-slate-500"></i>
                        </div>
                    </div>
                </div>

                <!-- Orders History -->
                <div class="md:col-span-2">
                    <div class="glass-card p-6 h-full">
                        <h3 class="text-xl font-bold mb-6">الطلبات السابقة</h3>
                        <div class="space-y-4" id="account-orders-container">
                            <!-- Injected via JS -->
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- View: Admin Dashboard -->
        <div id="view-admin" class="view">
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h2 class="text-3xl font-bold text-white">لوحة تحكم الإدارة (Admin)</h2>
                    <p class="text-slate-400 text-sm mt-1">نظرة عامة على أداء المتجر والمبيعات</p>
                </div>
                <button onclick="navigate('home')" class="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
                    <i class="fas fa-external-link-alt"></i> المتجر
                </button>
            </div>

            <!-- Stats Overview -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div class="glass-card p-5 border-r-4 border-r-green-500">
                    <div class="text-slate-400 text-xs mb-1 font-medium uppercase tracking-wider">إجمالي المبيعات</div>
                    <div class="text-2xl font-bold text-white mb-2" id="admin-sales">0 رس</div>
                    <div class="text-xs text-green-400"><i class="fas fa-arrow-up ml-1"></i> 12% هذا الشهر</div>
                </div>
                <div class="glass-card p-5 border-r-4 border-r-blue-500">
                    <div class="text-slate-400 text-xs mb-1 font-medium uppercase tracking-wider">الطلبات</div>
                    <div class="text-2xl font-bold text-white mb-2" id="admin-orders-count">0</div>
                    <div class="text-xs text-blue-400"><i class="fas fa-box ml-1"></i> قيد المعالجة: 5</div>
                </div>
                <div class="glass-card p-5 border-r-4 border-r-ven-primary">
                    <div class="text-slate-400 text-xs mb-1 font-medium uppercase tracking-wider">العملاء</div>
                    <div class="text-2xl font-bold text-white mb-2" id="admin-customers">0</div>
                    <div class="text-xs text-ven-accent"><i class="fas fa-users ml-1"></i> 3 مسجلين جدد</div>
                </div>
                <div class="glass-card p-5 border-r-4 border-r-yellow-500">
                    <div class="text-slate-400 text-xs mb-1 font-medium uppercase tracking-wider">النقاط المصدرة</div>
                    <div class="text-2xl font-bold text-white mb-2" id="admin-points">0</div>
                    <div class="text-xs text-yellow-400"><i class="fas fa-star ml-1"></i> التزام عالٍ بالولاء</div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Chart -->
                <div class="lg:col-span-2 glass-card p-6">
                    <h3 class="text-lg font-bold mb-4">المبيعات آخر 7 أيام</h3>
                    <div class="h-72 w-full" dir="ltr">
                        <canvas id="salesChart"></canvas>
                    </div>
                </div>

                <!-- Recent Orders -->
                <div class="glass-card p-6">
                    <h3 class="text-lg font-bold mb-4">أحدث الطلبات</h3>
                    <div class="space-y-4" id="admin-recent-orders">
                        <!-- Injected via JS -->
                    </div>
                </div>
            </div>
        </div>

    </main>

    <!-- Mobile Bottom Navigation -->
    <div class="fixed bottom-0 left-0 w-full glass z-[90] md:hidden flex justify-around py-3 pb-safe">
        <button onclick="navigate('home')" class="flex flex-col items-center text-slate-400 hover:text-ven-primary transition nav-btn" data-target="home">
            <i class="fas fa-home text-xl mb-1"></i>
            <span class="text-[10px] font-medium">الرئيسية</span>
        </button>
        <button onclick="navigate('cart')" class="flex flex-col items-center text-slate-400 hover:text-ven-primary transition relative nav-btn" data-target="cart">
            <i class="fas fa-shopping-cart text-xl mb-1"></i>
            <span class="absolute -top-1 -right-2 bg-ven-primary text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold border border-slate-900" id="mobile-cart-badge">0</span>
            <span class="text-[10px] font-medium">السلة</span>
        </button>
        <button onclick="navigate('account')" class="flex flex-col items-center text-slate-400 hover:text-ven-primary transition nav-btn" data-target="account">
            <i class="fas fa-user text-xl mb-1"></i>
            <span class="text-[10px] font-medium">حسابي</span>
        </button>
    </div>

    <!-- Toast Container -->
    <div id="toast-container"></div>

    <script>
        // --- DATA & STATE ---
        const DEMO_PRODUCTS = [
            { id: 1, name: 'سماعات رأس لاسلكية احترافية عازلة للضوضاء', price: 1500, pointsPrice: 15000, category: 'إلكترونيات', rating: 4.8, reviews: 124, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop', desc: 'استمتع بصوت نقي وعزل تام للضوضاء مع هذه السماعات اللاسلكية الرائدة. بطارية تدوم 30 ساعة متواصلة للحصول على أفضل تجربة.' },
            { id: 2, name: 'ساعة ذكية رياضية الجيل السابع', price: 899, pointsPrice: 8990, category: 'إلكترونيات', rating: 4.5, reviews: 89, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop', desc: 'تتبع نشاطك الرياضي ومعدل نبضات القلب ومستوى الأكسجين بدقة متناهية. شاشة ريتنا دائمة العرض.' },
            { id: 3, name: 'لوحة مفاتيح ميكانيكية مخصصة للألعاب', price: 450, pointsPrice: 4500, category: 'ألعاب', rating: 4.9, reviews: 210, img: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop', desc: 'أزرار ميكانيكية سريعة الاستجابة مع إضاءة RGB قابلة للتخصيص بالكامل. هيكل معدني متين.' },
            { id: 4, name: 'نظارة واقع افتراضي متطورة', price: 2100, pointsPrice: 21000, category: 'ألعاب', rating: 4.7, reviews: 56, img: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=800&auto=format&fit=crop', desc: 'انغمس في عوالم افتراضية مع دقة 4K وتتبع حركة دقيق بدون أسلاك خارجية للحصول على حرية مطلقة.' },
        ];

        let state = {
            user: {
                name: 'أحمد محمد',
                email: 'ahmed@example.com',
                points: 2500,
                referralCode: 'VEN-A1B2',
                referredBy: null 
            },
            cart: [],
            orders: [],
            currentProductId: 1,
            checkoutMethod: 'CASH', // CASH or POINTS
            referralApplied: false,
            admin: {
                totalSales: 45000,
                ordersCount: 124,
                customers: 85,
                pointsIssued: 150000
            }
        };

        let salesChartInstance = null;

        // --- UTILS ---
        const formatMoney = (amount) => amount.toLocaleString() + ' رس';
        const formatPoints = (amount) => amount.toLocaleString() + ' نقطة';
        
        function showToast(message, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            const icon = type === 'success' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-exclamation-triangle"></i>';
            toast.className = 'toast';
            if(type === 'error') toast.style.backgroundColor = '#ef4444';
            toast.innerHTML = `${icon} <span>${message}</span>`;
            container.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }

        // --- CORE LOGIC ---
        function addToCart(productId) {
            const product = DEMO_PRODUCTS.find(p => p.id === productId);
            if(!product) return;
            const existing = state.cart.find(item => item.id === productId);
            if (existing) existing.quantity++;
            else state.cart.push({ ...product, quantity: 1 });
            
            updateCartBadges();
            showToast('تمت إضافة المنتج للسلة بنجاح');
        }

        function removeFromCart(productId) {
            state.cart = state.cart.filter(item => item.id !== productId);
            updateCartBadges();
            renderCart();
        }

        function updateCartQuantity(productId, delta) {
            const item = state.cart.find(i => i.id === productId);
            if(item) {
                item.quantity += delta;
                if(item.quantity <= 0) removeFromCart(productId);
                else renderCart();
            }
        }

        function updateCartBadges() {
            const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
            document.getElementById('desktop-cart-badge').textContent = count;
            document.getElementById('mobile-cart-badge').textContent = count;
            document.getElementById('demo-cart-count').textContent = `(${count})`;
        }

        function getCartTotals() {
            const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const subtotalPoints = state.cart.reduce((sum, item) => sum + (item.pointsPrice * item.quantity), 0);
            const tax = subtotal * 0.15;
            const total = subtotal + tax;
            return { subtotal, tax, total, subtotalPoints };
        }

        function applyReferral() {
            const input = document.getElementById('referral-input').value.trim();
            if(!input) return;
            if(input.toUpperCase() === state.user.referralCode) {
                showToast('لا يمكنك استخدام كود الإحالة الخاص بك', 'error');
                return;
            }
            state.referralApplied = true;
            document.getElementById('referral-msg').classList.remove('hidden');
            showToast('تم تطبيق الكود! ستحصل على هدية بعد إتمام الطلب.');
        }

        function copyReferral() {
            navigator.clipboard.writeText(state.user.referralCode);
            showToast('تم نسخ كود الإحالة');
        }

        function placeOrder() {
            if(state.cart.length === 0) return;
            const totals = getCartTotals();
            
            if(state.checkoutMethod === 'POINTS') {
                if(state.user.points < totals.subtotalPoints) {
                    showToast('رصيد النقاط غير كافٍ لإتمام العملية', 'error');
                    return;
                }
                state.user.points -= totals.subtotalPoints;
            } else {
                const earned = Math.floor(totals.total * 10);
                state.user.points += earned;
                state.admin.pointsIssued += earned;
                state.admin.totalSales += totals.total;
            }

            if(state.referralApplied) {
                state.user.points += 500; 
                state.admin.pointsIssued += 500;
                state.admin.pointsIssued += 1000;
            }

            const order = {
                id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
                date: new Date().toLocaleDateString('ar-SA'),
                total: state.checkoutMethod === 'CASH' ? formatMoney(totals.total) : formatPoints(totals.subtotalPoints),
                itemsCount: state.cart.reduce((sum, item) => sum + item.quantity, 0),
                status: 'قيد المعالجة'
            };
            
            state.orders.unshift(order);
            state.admin.ordersCount++;
            
            state.cart = [];
            state.referralApplied = false;
            updateCartBadges();
            updateHeaderPoints();
            
            document.getElementById('tracking-order-id').textContent = '#' + order.id;
            navigate('tracking');
            showToast('تم إنشاء الطلب بنجاح!');
        }

        function updateHeaderPoints() {
            document.getElementById('header-points').textContent = state.user.points.toLocaleString();
        }

        // --- VIEWS RENDERERS ---

        function renderHome() {
            const grid = document.getElementById('products-grid');
            grid.innerHTML = DEMO_PRODUCTS.map(p => `
                <div class="glass-card overflow-hidden hover-lift flex flex-col group">
                    <div class="relative aspect-square overflow-hidden bg-slate-800 cursor-pointer" onclick="openProduct(${p.id})">
                        <img src="${p.img}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                        <div class="absolute top-2 right-2 bg-slate-900/80 backdrop-blur rounded px-2 py-1 flex items-center gap-1 text-xs">
                            <i class="fas fa-star text-yellow-400 text-[10px]"></i> ${p.rating}
                        </div>
                    </div>
                    <div class="p-4 flex flex-col flex-grow">
                        <div class="text-xs text-ven-accent mb-1">${p.category}</div>
                        <h3 class="font-bold text-sm mb-2 line-clamp-2 cursor-pointer hover:text-ven-accent transition" onclick="openProduct(${p.id})">${p.name}</h3>
                        <div class="mt-auto pt-3 border-t border-slate-700/50">
                            <div class="font-extrabold text-lg">${formatMoney(p.price)}</div>
                            <div class="text-xs text-yellow-400 mt-0.5"><i class="fas fa-star text-[10px]"></i> ${formatPoints(p.pointsPrice)}</div>
                        </div>
                        <button onclick="addToCart(${p.id})" class="w-full mt-4 bg-slate-800 hover:bg-ven-primary border border-slate-600 hover:border-ven-primary text-white py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2">
                            <i class="fas fa-cart-plus"></i> إضافة للسلة
                        </button>
                    </div>
                </div>
            `).join('');
        }

        function openProduct(id) {
            state.currentProductId = id;
            navigate('product-details');
        }

        function renderProductDetails() {
            const p = DEMO_PRODUCTS.find(prod => prod.id === state.currentProductId);
            if(!p) return;
            const container = document.getElementById('product-details-container');
            container.innerHTML = `
                <div class="flex flex-col md:flex-row gap-8">
                    <div class="w-full md:w-1/2 aspect-square rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                        <img src="${p.img}" class="w-full h-full object-cover">
                    </div>
                    <div class="w-full md:w-1/2 flex flex-col">
                        <div class="text-sm text-ven-accent font-medium mb-2">${p.category}</div>
                        <h1 class="text-3xl font-extrabold mb-4 leading-tight">${p.name}</h1>
                        <div class="flex items-center gap-3 mb-6">
                            <div class="flex text-yellow-400 text-sm"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i></div>
                            <span class="text-slate-400 text-sm">${p.rating} (${p.reviews} تقييم)</span>
                        </div>
                        <p class="text-slate-300 mb-8 leading-relaxed">${p.desc}</p>
                        
                        <div class="bg-slate-800/50 rounded-xl p-5 border border-slate-700 mb-8">
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-slate-400 text-sm">السعر النقدي</span>
                                <span class="text-2xl font-extrabold text-white">${formatMoney(p.price)} <span class="text-sm font-normal text-slate-400">شامل الضريبة</span></span>
                            </div>
                            <div class="flex justify-between items-center pt-2 border-t border-slate-700/50">
                                <span class="text-slate-400 text-sm flex items-center gap-1"><i class="fas fa-star text-yellow-400"></i> أو الدفع بالنقاط</span>
                                <span class="text-lg font-bold text-yellow-400">${formatPoints(p.pointsPrice)}</span>
                            </div>
                        </div>

                        <div class="mt-auto">
                            <button onclick="addToCart(${p.id})" class="w-full bg-ven-primary hover:bg-ven-primaryDark text-white py-4 rounded-xl font-bold transition shadow-lg text-lg flex items-center justify-center gap-2 hover-lift">
                                <i class="fas fa-shopping-cart"></i> أضف إلى السلة
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderCart() {
            const container = document.getElementById('cart-items-container');
            const btn = document.getElementById('checkout-btn');
            
            if(state.cart.length === 0) {
                container.innerHTML = `
                    <div class="glass-card p-12 text-center text-slate-400">
                        <i class="fas fa-shopping-basket text-6xl mb-4 opacity-20"></i>
                        <h3 class="text-xl font-bold text-white mb-2">السلة فارغة</h3>
                        <p class="mb-6">لم تقم بإضافة أي منتجات حتى الآن.</p>
                        <button onclick="navigate('home')" class="bg-ven-primary text-white px-6 py-2 rounded-lg hover:bg-ven-primaryDark transition shadow-lg">تصفح المنتجات</button>
                    </div>`;
                document.getElementById('cart-subtotal').textContent = '0 رس';
                document.getElementById('cart-tax').textContent = '0 رس';
                document.getElementById('cart-total').textContent = '0 رس';
                document.getElementById('cart-points-total').textContent = '0 نقطة';
                btn.disabled = true;
                return;
            }

            btn.disabled = false;
            container.innerHTML = state.cart.map(item => `
                <div class="glass-card p-4 mb-4 flex gap-4 items-center">
                    <img src="${item.img}" class="w-20 h-20 rounded-lg object-cover bg-slate-800 shrink-0">
                    <div class="flex-grow">
                        <h4 class="font-bold text-sm mb-1 line-clamp-1">${item.name}</h4>
                        <div class="text-ven-primary font-bold text-sm mb-1">${formatMoney(item.price)}</div>
                        <div class="text-xs text-yellow-400"><i class="fas fa-star text-[10px]"></i> ${formatPoints(item.pointsPrice)}</div>
                    </div>
                    <div class="flex flex-col items-end gap-2 shrink-0">
                        <button onclick="removeFromCart(${item.id})" class="text-rose-400 hover:text-rose-300 text-xs transition"><i class="fas fa-trash"></i> إزالة</button>
                        <div class="flex items-center bg-slate-800 rounded-lg border border-slate-700">
                            <button onclick="updateCartQuantity(${item.id}, 1)" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition">+</button>
                            <span class="w-8 text-center text-sm font-bold">${item.quantity}</span>
                            <button onclick="updateCartQuantity(${item.id}, -1)" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition">-</button>
                        </div>
                    </div>
                </div>
            `).join('');

            const totals = getCartTotals();
            document.getElementById('cart-subtotal').textContent = formatMoney(totals.subtotal);
            document.getElementById('cart-tax').textContent = formatMoney(totals.tax);
            document.getElementById('cart-total').textContent = formatMoney(totals.total);
            document.getElementById('cart-points-total').textContent = formatPoints(totals.subtotalPoints);
        }

        function updateCheckoutMethod() {
            const method = document.querySelector('input[name="payment_method"]:checked').value;
            state.checkoutMethod = method;
            
            const cashLabel = document.getElementById('pay-cash-label');
            const pointsLabel = document.getElementById('pay-points-label');
            
            if(method === 'CASH') {
                cashLabel.classList.replace('border-slate-700', 'border-ven-primary');
                cashLabel.classList.replace('bg-slate-800/50', 'bg-ven-primary/10');
                pointsLabel.classList.replace('border-ven-primary', 'border-slate-700');
                pointsLabel.classList.replace('bg-ven-primary/10', 'bg-slate-800/50');
            } else {
                pointsLabel.classList.replace('border-slate-700', 'border-ven-primary');
                pointsLabel.classList.replace('bg-slate-800/50', 'bg-ven-primary/10');
                cashLabel.classList.replace('border-ven-primary', 'border-slate-700');
                cashLabel.classList.replace('bg-ven-primary/10', 'bg-slate-800/50');
            }
            
            renderCheckoutSummary();
        }

        function renderCheckout() {
            if(state.cart.length === 0) {
                navigate('cart');
                return;
            }
            const totals = getCartTotals();
            document.getElementById('checkout-cash-amount').textContent = formatMoney(totals.total);
            document.getElementById('checkout-points-amount').textContent = formatPoints(totals.subtotalPoints);
            document.getElementById('checkout-user-points').textContent = state.user.points.toLocaleString();
            
            document.getElementById('referral-input').value = '';
            document.getElementById('referral-msg').classList.add('hidden');
            state.referralApplied = false;

            const pointsRadio = document.querySelector('input[value="POINTS"]');
            if(state.user.points < totals.subtotalPoints) {
                pointsRadio.disabled = true;
                pointsRadio.parentElement.classList.add('opacity-50', 'cursor-not-allowed');
                state.checkoutMethod = 'CASH';
                document.querySelector('input[value="CASH"]').checked = true;
            } else {
                pointsRadio.disabled = false;
                pointsRadio.parentElement.classList.remove('opacity-50', 'cursor-not-allowed');
            }
            
            updateCheckoutMethod();
        }

        function renderCheckoutSummary() {
            const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
            document.getElementById('checkout-item-count').textContent = count;
            
            const totals = getCartTotals();
            const totalEl = document.getElementById('checkout-final-total');
            
            if(state.checkoutMethod === 'CASH') {
                totalEl.textContent = formatMoney(totals.total);
                totalEl.className = 'font-bold text-2xl text-ven-primary';
            } else {
                totalEl.textContent = formatPoints(totals.subtotalPoints);
                totalEl.className = 'font-bold text-xl text-yellow-400 flex items-center gap-1';
                totalEl.innerHTML += ' <i class="fas fa-star text-sm mb-1"></i>';
            }
        }

        function renderAccount() {
            document.getElementById('account-name').textContent = state.user.name;
            document.getElementById('account-points').textContent = state.user.points.toLocaleString();
            document.getElementById('account-referral').textContent = state.user.referralCode;
            
            const container = document.getElementById('account-orders-container');
            if(state.orders.length === 0) {
                container.innerHTML = '<p class="text-sm text-slate-400">لا توجد طلبات سابقة.</p>';
                return;
            }
            container.innerHTML = state.orders.map(o => `
                <div class="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex justify-between items-center hover:bg-slate-800 transition cursor-pointer" onclick="navigate('tracking')">
                    <div>
                        <div class="font-bold text-white mb-1">${o.id}</div>
                        <div class="text-xs text-slate-400">${o.date} • ${o.itemsCount} منتجات</div>
                    </div>
                    <div class="text-left">
                        <div class="font-bold text-ven-accent mb-1">${o.total}</div>
                        <div class="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded uppercase">${o.status}</div>
                    </div>
                </div>
            `).join('');
        }

        function renderAdmin() {
            document.getElementById('admin-sales').textContent = formatMoney(state.admin.totalSales);
            document.getElementById('admin-orders-count').textContent = state.admin.ordersCount;
            document.getElementById('admin-customers').textContent = state.admin.customers;
            document.getElementById('admin-points').textContent = state.admin.pointsIssued.toLocaleString();

            const container = document.getElementById('admin-recent-orders');
            if(state.orders.length > 0) {
                 container.innerHTML = state.orders.slice(0,5).map(o => `
                    <div class="flex justify-between items-center py-3 border-b border-slate-700/50 last:border-0">
                        <div>
                            <span class="text-sm font-bold text-white">${o.id}</span>
                            <span class="text-xs text-slate-400 ml-2">${state.user.name}</span>
                        </div>
                        <div class="text-sm font-bold text-ven-accent">${o.total}</div>
                    </div>
                 `).join('');
            } else {
                 container.innerHTML = '<div class="text-sm text-slate-500 py-2">لا توجد طلبات حديثة.</div>';
            }

            if(salesChartInstance) salesChartInstance.destroy();
            const ctx = document.getElementById('salesChart').getContext('2d');
            salesChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'اليوم'],
                    datasets: [{
                        label: 'المبيعات (رس)',
                        data: [12000, 19000, 15000, 25000, 22000, 30000, state.admin.totalSales > 45000 ? state.admin.totalSales - 45000 : 35000],
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#1e293b',
                        pointBorderColor: '#8b5cf6'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' }, position: 'right' },
                        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        }

        // --- ROUTER ---
        function navigate(viewId) {
            document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
            document.getElementById('view-' + viewId).classList.add('active');
            
            document.querySelectorAll('.nav-btn').forEach(el => {
                if(el.dataset.target === viewId) {
                    el.classList.add('text-ven-primary');
                    el.classList.remove('text-slate-400');
                } else {
                    el.classList.remove('text-ven-primary');
                    el.classList.add('text-slate-400');
                }
            });

            window.scrollTo({top: 0, behavior: 'smooth'});

            if(viewId === 'home') renderHome();
            if(viewId === 'product-details') renderProductDetails();
            if(viewId === 'cart') renderCart();
            if(viewId === 'checkout') renderCheckout();
            if(viewId === 'account') renderAccount();
            if(viewId === 'admin') renderAdmin();
        }

        // --- INIT ---
        updateHeaderPoints();
        updateCartBadges();
        navigate('home');

    </script>
</body>
</html>
"""

print("Writing HTML file...")

with open('prototype/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
