import os

html_content = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ven+ | Interactive Presentation Prototype</title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        ven: {
                            900: '#0f172a',
                            800: '#1e293b',
                            700: '#334155',
                            primary: '#8b5cf6',
                            primaryDark: '#7c3aed',
                            accent: '#c084fc',
                            success: '#10b981',
                            warning: '#f59e0b',
                            danger: '#ef4444'
                        }
                    },
                    fontFamily: {
                        sans: ['"Tajawal"', 'sans-serif'],
                    }
                }
            }
        }
    </script>
    
    <!-- Fonts & Icons -->
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <style>
        /* Custom Styles & Animations */
        body { 
            background-color: #020617; 
            color: #f8fafc; 
            font-family: 'Tajawal', sans-serif; 
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
        }
        
        .glass { 
            background: rgba(15, 23, 42, 0.75); 
            backdrop-filter: blur(16px); 
            -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05); 
        }
        
        .glass-card { 
            background: rgba(30, 41, 59, 0.5); 
            backdrop-filter: blur(12px); 
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.08); 
            border-radius: 1.25rem; 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* SPA View Transitions */
        .view { 
            display: none; 
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .view.active { 
            display: block; 
            animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes fadeIn { 
            from { opacity: 0; transform: translateY(15px); } 
            to { opacity: 1; transform: translateY(0); } 
        }
        
        /* Toasts */
        #toast-container { 
            position: fixed; 
            bottom: 90px; 
            left: 50%; 
            transform: translateX(-50%); 
            z-index: 1000; 
            display: flex; 
            flex-direction: column; 
            gap: 12px; 
            pointer-events: none;
        }
        @media (min-width: 768px) {
            #toast-container { bottom: 30px; left: 30px; transform: none; }
        }
        .toast { 
            background: rgba(139, 92, 246, 0.95); 
            backdrop-filter: blur(8px);
            color: white; 
            padding: 14px 24px; 
            border-radius: 12px; 
            box-shadow: 0 10px 25px -5px rgba(139, 92, 246, 0.4); 
            animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; 
            font-weight: 500; 
            display: flex; 
            align-items: center; 
            gap: 12px;
            pointer-events: auto;
        }
        .toast.error { background: rgba(239, 68, 68, 0.95); box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.4); }
        @keyframes slideUp { 
            from { opacity: 0; transform: translateY(30px) scale(0.95); } 
            to { opacity: 1; transform: translateY(0) scale(1); } 
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0) scale(1); }
            to { opacity: 0; transform: translateY(-10px) scale(0.95); }
        }
        
        /* Interactive Elements */
        .hover-lift { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .hover-lift:hover { 
            transform: translateY(-5px); 
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2); 
            border-color: rgba(139, 92, 246, 0.3);
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            color: white;
            box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.39);
            transition: all 0.2s ease;
        }
        .btn-primary:hover {
            box-shadow: 0 6px 20px rgba(139, 92, 246, 0.23);
            transform: translateY(-1px);
        }
        .btn-primary:active {
            transform: translateY(1px);
        }

        .pb-safe { padding-bottom: calc(env(safe-area-inset-bottom) + 16px); }
        
        /* Custom Inputs */
        .input-premium {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            transition: all 0.2s ease;
        }
        .input-premium:focus {
            outline: none;
            border-color: #8b5cf6;
            box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
            background: rgba(15, 23, 42, 0.8);
        }

        /* Loading Spinner */
        .loader {
            border: 3px solid rgba(139, 92, 246, 0.2);
            border-top: 3px solid #8b5cf6;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body class="antialiased pb-24 md:pb-0 selection:bg-ven-primary selection:text-white">

    <!-- DEMO CONTROLS -->
    <div class="fixed top-0 left-0 w-full bg-slate-900/95 backdrop-blur border-b border-ven-primary/40 z-[100] py-2 px-4 flex items-center gap-3 overflow-x-auto hide-scrollbar text-xs font-mono shadow-2xl" style="direction: ltr;">
        <div class="flex items-center gap-2 mr-2">
            <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span class="text-white font-bold tracking-widest uppercase">Ven+ Prototype</span>
        </div>
        <div class="w-px h-4 bg-slate-700 mx-2"></div>
        <button onclick="navigate('home')" class="bg-slate-800 text-slate-300 border border-slate-600 px-3 py-1 rounded hover:bg-slate-700 hover:text-white transition whitespace-nowrap">Home</button>
        <button onclick="navigate('products')" class="bg-slate-800 text-slate-300 border border-slate-600 px-3 py-1 rounded hover:bg-slate-700 hover:text-white transition whitespace-nowrap">Store</button>
        <button onclick="navigate('cart')" class="bg-slate-800 text-slate-300 border border-slate-600 px-3 py-1 rounded hover:bg-slate-700 hover:text-white transition whitespace-nowrap">Cart <span id="demo-cart-badge" class="text-ven-primary ml-1">(0)</span></button>
        <button onclick="navigate('checkout')" class="bg-slate-800 text-slate-300 border border-slate-600 px-3 py-1 rounded hover:bg-slate-700 hover:text-white transition whitespace-nowrap">Checkout</button>
        <button onclick="navigate('account')" class="bg-slate-800 text-slate-300 border border-slate-600 px-3 py-1 rounded hover:bg-slate-700 hover:text-white transition whitespace-nowrap">Account</button>
        <div class="flex-grow"></div>
        <button onclick="navigate('admin')" class="bg-indigo-900/50 text-indigo-200 border border-indigo-700/50 px-4 py-1 rounded hover:bg-indigo-800 transition whitespace-nowrap flex items-center gap-2">
            <i class="fas fa-chart-line"></i> Admin Dashboard
        </button>
    </div>

    <!-- MAIN HEADER (Storefront) -->
    <header id="main-header" class="glass fixed top-[45px] left-0 w-full z-50 transition-transform duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
            
            <div class="flex items-center gap-8">
                <!-- Logo -->
                <div class="text-3xl font-black text-white tracking-tighter cursor-pointer flex items-center gap-1" onclick="navigate('home')">
                    Ven<span class="text-ven-primary">+</span>
                </div>
                
                <!-- Desktop Nav -->
                <nav class="hidden lg:flex items-center gap-8">
                    <a href="#" onclick="navigate('home')" class="text-sm font-bold text-white transition">الرئيسية</a>
                    <a href="#" onclick="navigate('products')" class="text-sm font-medium text-slate-400 hover:text-white transition">المنتجات</a>
                    <a href="#" onclick="navigate('products')" class="text-sm font-medium text-slate-400 hover:text-white transition">التصنيفات</a>
                    <a href="#" onclick="navigate('products')" class="text-sm font-medium text-ven-accent hover:text-white transition flex items-center gap-1">
                        <i class="fas fa-tag text-xs"></i> العروض
                    </a>
                </nav>
            </div>

            <div class="flex items-center gap-5">
                <!-- Search -->
                <div class="relative w-full max-w-[280px] hidden md:block">
                    <i class="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                    <input type="text" placeholder="ابحث عن أحدث التقنيات..." class="w-full bg-slate-800/80 border border-slate-700/80 rounded-full py-2.5 pr-11 pl-4 text-sm focus:outline-none focus:border-ven-primary focus:ring-1 focus:ring-ven-primary transition text-white placeholder-slate-500">
                </div>

                <!-- Points Badge -->
                <div class="hidden md:flex items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50 cursor-pointer hover:border-yellow-500/30 transition shadow-inner" onclick="navigate('account')">
                    <i class="fas fa-star text-yellow-400 text-sm drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]"></i>
                    <span class="text-sm font-bold text-yellow-50" id="header-points">0</span>
                </div>

                <!-- Icons -->
                <div class="flex items-center gap-2">
                    <button class="relative p-2 text-slate-400 hover:text-white transition">
                        <i class="far fa-heart text-xl"></i>
                    </button>
                    <button onclick="navigate('cart')" class="relative p-2 text-slate-400 hover:text-white transition group">
                        <i class="fas fa-shopping-bag text-xl group-hover:scale-110 transition-transform"></i>
                        <span class="absolute top-0 right-0 bg-ven-primary text-white text-[10px] rounded-full w-[18px] h-[18px] flex items-center justify-center font-bold border-2 border-[#0f172a]" id="header-cart-badge">0</span>
                    </button>
                    <button onclick="navigate('account')" class="hidden sm:block p-2 text-slate-400 hover:text-white transition ml-2">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-ven-primary to-ven-accent flex items-center justify-center text-white font-bold text-sm">أ</div>
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- MAIN CONTENT -->
    <main class="pt-[140px] pb-10 min-h-screen">
        <!-- Views will be injected here via Python string continuation -->
"""

with open('generate_prototype_part2.py', 'w') as f:
    f.write('''
views_html = """
        <!-- ========================================== -->
        <!-- VIEW: HOME                                 -->
        <!-- ========================================== -->
        <div id="view-home" class="view active max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Hero Section -->
            <div class="relative rounded-3xl overflow-hidden bg-ven-900 border border-slate-800 mb-16 shadow-2xl">
                <div class="absolute inset-0">
                    <img src="https://images.unsplash.com/photo-1600861194942-f883de0dfe96?q=80&w=2000&auto=format&fit=crop" class="w-full h-full object-cover opacity-40 mix-blend-luminosity">
                </div>
                <div class="absolute inset-0 bg-gradient-to-l from-slate-900 via-slate-900/90 to-transparent"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
                
                <div class="relative z-10 p-8 md:p-16 lg:p-24 w-full md:w-3/4 lg:w-2/3">
                    <div class="inline-flex items-center gap-2 bg-ven-primary/10 text-ven-accent px-4 py-1.5 rounded-full text-xs font-bold mb-6 border border-ven-primary/20 backdrop-blur-md">
                        <span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-ven-accent opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-ven-accent"></span></span>
                        الإطلاق الجديد 2026
                    </div>
                    <h1 class="text-4xl md:text-5xl lg:text-7xl font-black mb-6 leading-[1.1] tracking-tight">
                        مستقبل التقنية <br>
                        <span class="text-transparent bg-clip-text bg-gradient-to-r from-ven-accent to-ven-primary">بين يديك اليوم.</span>
                    </h1>
                    <p class="text-slate-300 mb-10 max-w-lg text-lg leading-relaxed">
                        تسوق أحدث الأجهزة الذكية الفاخرة. ادفع بالطريقة التي تناسبك، واستخدم نقاطك المكتسبة للحصول على مكافآت حصرية.
                    </p>
                    <div class="flex flex-wrap gap-4">
                        <button onclick="navigate('products')" class="btn-primary px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3">
                            تسوّق التشكيلة الجديدة <i class="fas fa-arrow-left"></i>
                        </button>
                        <button onclick="navigate('account')" class="bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-white px-8 py-4 rounded-xl font-bold transition flex items-center gap-3 backdrop-blur">
                            اكتشف برنامج الولاء <i class="fas fa-star text-yellow-400"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Categories Banner -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                <div class="glass-card p-6 text-center hover-lift cursor-pointer" onclick="navigate('products')">
                    <div class="w-16 h-16 mx-auto bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-2xl text-ven-accent"><i class="fas fa-laptop"></i></div>
                    <h3 class="font-bold">أجهزة كمبيوتر</h3>
                </div>
                <div class="glass-card p-6 text-center hover-lift cursor-pointer" onclick="navigate('products')">
                    <div class="w-16 h-16 mx-auto bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-2xl text-ven-accent"><i class="fas fa-mobile-alt"></i></div>
                    <h3 class="font-bold">هواتف ذكية</h3>
                </div>
                <div class="glass-card p-6 text-center hover-lift cursor-pointer" onclick="navigate('products')">
                    <div class="w-16 h-16 mx-auto bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-2xl text-ven-accent"><i class="fas fa-headphones"></i></div>
                    <h3 class="font-bold">صوتيات</h3>
                </div>
                <div class="glass-card p-6 text-center hover-lift cursor-pointer" onclick="navigate('products')">
                    <div class="w-16 h-16 mx-auto bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-2xl text-ven-accent"><i class="fas fa-gamepad"></i></div>
                    <h3 class="font-bold">ألعاب</h3>
                </div>
            </div>

            <!-- Featured Products -->
            <div class="flex justify-between items-end mb-8">
                <div>
                    <h2 class="text-3xl font-black mb-2">وصل حديثاً</h2>
                    <p class="text-slate-400">أحدث المنتجات المضافة للمتجر</p>
                </div>
                <button onclick="navigate('products')" class="text-ven-accent font-bold hover:text-white transition flex items-center gap-2">
                    عرض الكل <i class="fas fa-arrow-left text-sm"></i>
                </button>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="home-products-grid">
                <!-- Injected via JS -->
            </div>
            
            <!-- Features Bottom -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 mb-10">
                <div class="flex items-start gap-4 p-6 bg-slate-900 rounded-2xl border border-slate-800">
                    <div class="w-12 h-12 rounded-full bg-ven-primary/20 text-ven-primary flex items-center justify-center text-xl shrink-0"><i class="fas fa-shipping-fast"></i></div>
                    <div>
                        <h4 class="font-bold text-lg mb-1">توصيل سريع</h4>
                        <p class="text-sm text-slate-400">شحن مجاني للطلبات فوق 500 رس</p>
                    </div>
                </div>
                <div class="flex items-start gap-4 p-6 bg-slate-900 rounded-2xl border border-slate-800">
                    <div class="w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center text-xl shrink-0"><i class="fas fa-star"></i></div>
                    <div>
                        <h4 class="font-bold text-lg mb-1">نقاط ومكافآت</h4>
                        <p class="text-sm text-slate-400">اجمع النقاط واستخدمها كطريقة دفع</p>
                    </div>
                </div>
                <div class="flex items-start gap-4 p-6 bg-slate-900 rounded-2xl border border-slate-800">
                    <div class="w-12 h-12 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xl shrink-0"><i class="fas fa-shield-alt"></i></div>
                    <div>
                        <h4 class="font-bold text-lg mb-1">دفع آمن</h4>
                        <p class="text-sm text-slate-400">تشفير كامل وحماية لبياناتك</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- ========================================== -->
        <!-- VIEW: PRODUCTS LISTING                     -->
        <!-- ========================================== -->
        <div id="view-products" class="view max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col md:flex-row gap-8">
                <!-- Sidebar Filters -->
                <div class="w-full md:w-64 shrink-0">
                    <div class="glass-card p-6 sticky top-32">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="font-bold text-lg"><i class="fas fa-filter text-ven-accent ml-2"></i> تصفية النتائج</h3>
                            <button class="text-xs text-slate-400 hover:text-white">إعادة ضبط</button>
                        </div>
                        
                        <div class="space-y-6">
                            <!-- Category Filter -->
                            <div>
                                <h4 class="font-bold text-sm text-slate-300 mb-3">التصنيفات</h4>
                                <div class="space-y-2">
                                    <label class="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" checked class="w-4 h-4 accent-ven-primary rounded bg-slate-800 border-slate-700">
                                        <span class="text-sm text-slate-300 group-hover:text-white transition">الكل</span>
                                    </label>
                                    <label class="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" class="w-4 h-4 accent-ven-primary rounded bg-slate-800 border-slate-700">
                                        <span class="text-sm text-slate-300 group-hover:text-white transition">إلكترونيات</span>
                                    </label>
                                    <label class="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" class="w-4 h-4 accent-ven-primary rounded bg-slate-800 border-slate-700">
                                        <span class="text-sm text-slate-300 group-hover:text-white transition">ألعاب</span>
                                    </label>
                                    <label class="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" class="w-4 h-4 accent-ven-primary rounded bg-slate-800 border-slate-700">
                                        <span class="text-sm text-slate-300 group-hover:text-white transition">اكسسوارات</span>
                                    </label>
                                </div>
                            </div>
                            
                            <!-- Price Filter -->
                            <div class="border-t border-slate-700/50 pt-6">
                                <h4 class="font-bold text-sm text-slate-300 mb-3">نطاق السعر</h4>
                                <div class="flex items-center gap-2">
                                    <input type="number" placeholder="من" class="w-full input-premium rounded-lg p-2 text-sm text-center">
                                    <span class="text-slate-500">-</span>
                                    <input type="number" placeholder="إلى" class="w-full input-premium rounded-lg p-2 text-sm text-center">
                                </div>
                            </div>

                            <!-- Points Filter -->
                            <div class="border-t border-slate-700/50 pt-6">
                                <label class="flex items-center justify-between cursor-pointer group bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                                    <div class="flex items-center gap-2">
                                        <i class="fas fa-star text-yellow-400 text-xs"></i>
                                        <span class="text-sm text-white font-medium">قابل للدفع بالنقاط</span>
                                    </div>
                                    <input type="checkbox" class="w-4 h-4 accent-ven-primary">
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Grid -->
                <div class="flex-grow">
                    <div class="flex flex-col sm:flex-row justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl mb-6 gap-4">
                        <div class="text-sm text-slate-400">عرض <span class="text-white font-bold">12</span> من أصل <span class="text-white font-bold">45</span> منتج</div>
                        <div class="flex items-center gap-3">
                            <label class="text-sm text-slate-400">ترتيب حسب:</label>
                            <select class="input-premium py-1.5 px-3 rounded-lg text-sm bg-slate-800">
                                <option>الأحدث</option>
                                <option>السعر: من الأقل للأعلى</option>
                                <option>السعر: من الأعلى للأقل</option>
                                <option>الأعلى تقييماً</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 lg:grid-cols-3 gap-6" id="products-listing-grid">
                        <!-- Injected via JS -->
                    </div>

                    <!-- Pagination -->
                    <div class="flex justify-center mt-12 mb-8">
                        <div class="flex gap-2">
                            <button class="w-10 h-10 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition disabled:opacity-50"><i class="fas fa-chevron-right"></i></button>
                            <button class="w-10 h-10 rounded-lg bg-ven-primary text-white font-bold flex items-center justify-center">1</button>
                            <button class="w-10 h-10 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition">2</button>
                            <button class="w-10 h-10 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition">3</button>
                            <button class="w-10 h-10 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition"><i class="fas fa-chevron-left"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ========================================== -->
        <!-- VIEW: PRODUCT DETAILS                      -->
        <!-- ========================================== -->
        <div id="view-product-details" class="view max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="mb-6 flex items-center gap-2 text-sm text-slate-400">
                <a href="#" onclick="navigate('home')" class="hover:text-white transition">الرئيسية</a>
                <i class="fas fa-chevron-left text-[10px]"></i>
                <a href="#" onclick="navigate('products')" class="hover:text-white transition" id="pd-category-bc">إلكترونيات</a>
                <i class="fas fa-chevron-left text-[10px]"></i>
                <span class="text-ven-accent truncate max-w-[200px]" id="pd-name-bc">اسم المنتج</span>
            </div>
            
            <div class="glass-card p-6 md:p-10 mb-12">
                <div class="flex flex-col lg:flex-row gap-10">
                    <!-- Image Gallery -->
                    <div class="w-full lg:w-1/2 shrink-0">
                        <div class="aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 mb-4 relative">
                            <img id="pd-main-img" src="" class="w-full h-full object-cover">
                            <button class="absolute top-4 right-4 w-10 h-10 bg-slate-900/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:text-rose-400 hover:bg-slate-900 transition border border-slate-700">
                                <i class="far fa-heart"></i>
                            </button>
                        </div>
                        <div class="flex gap-4 overflow-x-auto hide-scrollbar" id="pd-thumbnails">
                            <!-- Generated in JS -->
                        </div>
                    </div>
                    
                    <!-- Product Info -->
                    <div class="w-full lg:w-1/2 flex flex-col">
                        <div class="bg-ven-primary/20 text-ven-accent px-3 py-1 rounded-full text-xs font-bold w-max border border-ven-primary/30 mb-4" id="pd-stock-badge">متوفر في المخزون</div>
                        
                        <h1 class="text-3xl md:text-4xl font-black mb-4 leading-tight" id="pd-name">اسم المنتج</h1>
                        
                        <div class="flex items-center gap-4 mb-6 border-b border-slate-700/50 pb-6">
                            <div class="flex items-center text-yellow-400 text-sm">
                                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i>
                                <span class="text-white font-bold ml-2 mr-1" id="pd-rating">4.8</span>
                            </div>
                            <div class="w-1 h-1 bg-slate-600 rounded-full"></div>
                            <a href="#reviews" class="text-sm text-slate-400 hover:text-ven-accent transition underline decoration-slate-600 underline-offset-4"><span id="pd-reviews">120</span> تقييم</a>
                        </div>
                        
                        <!-- Pricing Options -->
                        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 relative overflow-hidden shadow-inner">
                            <div class="absolute top-0 right-0 w-32 h-32 bg-ven-primary/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            
                            <!-- Cash Price -->
                            <div class="flex justify-between items-end mb-4">
                                <div>
                                    <div class="text-sm text-slate-400 mb-1">السعر النقدي</div>
                                    <div class="flex items-end gap-3">
                                        <span class="text-4xl font-black text-white" id="pd-price">0 رس</span>
                                        <span class="text-lg text-slate-500 line-through mb-1" id="pd-old-price"></span>
                                    </div>
                                </div>
                                <div class="bg-green-500/10 text-green-400 px-2 py-1 rounded text-xs font-bold border border-green-500/20" id="pd-discount">خصم 15%</div>
                            </div>
                            
                            <!-- Points Divider -->
                            <div class="flex items-center gap-4 my-4">
                                <div class="h-px bg-slate-700/50 flex-grow"></div>
                                <div class="text-xs font-bold text-slate-500 bg-slate-800 px-3 py-1 rounded-full">أو</div>
                                <div class="h-px bg-slate-700/50 flex-grow"></div>
                            </div>
                            
                            <!-- Points Price -->
                            <div class="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                                        <i class="fas fa-star"></i>
                                    </div>
                                    <div>
                                        <div class="text-xs text-yellow-200/70 font-medium">استبدل بنقاطك</div>
                                        <div class="font-bold text-yellow-400 text-lg" id="pd-points-price">0 نقطة</div>
                                    </div>
                                </div>
                                <button class="text-xs text-ven-accent underline hover:text-white">كيفية الجمع؟</button>
                            </div>
                        </div>
                        
                        <!-- Description -->
                        <div class="mb-8">
                            <h3 class="font-bold text-lg mb-3">وصف المنتج</h3>
                            <p class="text-slate-300 leading-relaxed text-sm" id="pd-desc">وصف المنتج هنا</p>
                        </div>
                        
                        <!-- Actions -->
                        <div class="mt-auto border-t border-slate-700/50 pt-6">
                            <div class="flex items-center gap-4 mb-4">
                                <div class="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-xl h-14 px-2 w-32">
                                    <button onclick="changePDQuantity(-1)" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"><i class="fas fa-minus text-xs"></i></button>
                                    <span class="font-bold" id="pd-qty">1</span>
                                    <button onclick="changePDQuantity(1)" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"><i class="fas fa-plus text-xs"></i></button>
                                </div>
                                <button onclick="addToCartFromPD()" class="flex-grow bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white h-14 rounded-xl font-bold transition flex justify-center items-center gap-3 shadow-lg">
                                    <i class="fas fa-cart-plus"></i> إضافة للسلة
                                </button>
                            </div>
                            <button onclick="buyNowFromPD()" class="w-full btn-primary h-14 rounded-xl font-bold transition flex justify-center items-center gap-2 text-lg">
                                شراء الآن
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

"""

with open('generate_prototype_part3.py', 'w') as f:
    f.write('''
views_html2 = """
        <!-- ========================================== -->
        <!-- VIEW: CART                                 -->
        <!-- ========================================== -->
        <div id="view-cart" class="view max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-black mb-8 border-b border-slate-800 pb-4">سلة المشتريات</h2>
            <div class="flex flex-col lg:flex-row gap-8">
                <!-- Cart Items -->
                <div class="flex-grow space-y-4" id="cart-items-container">
                    <!-- Injected via JS -->
                </div>
                
                <!-- Order Summary -->
                <div class="w-full lg:w-[400px] shrink-0">
                    <div class="glass-card p-6 sticky top-28">
                        <h3 class="text-xl font-bold mb-6">ملخص الطلب</h3>
                        
                        <div class="space-y-4 text-sm text-slate-300">
                            <div class="flex justify-between">
                                <span>المجموع الفرعي</span>
                                <span id="cart-subtotal" class="font-bold text-white">0 رس</span>
                            </div>
                            <div class="flex justify-between">
                                <span>ضريبة القيمة المضافة (15%)</span>
                                <span id="cart-tax" class="font-bold text-white">0 رس</span>
                            </div>
                            <div class="flex justify-between">
                                <span>تكلفة الشحن</span>
                                <span class="text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded">مجاني</span>
                            </div>
                            
                            <div class="border-t border-slate-700/50 pt-4 mt-4">
                                <div class="flex justify-between items-end mb-1">
                                    <span class="font-bold text-white text-lg">الإجمالي المطلوب</span>
                                    <span id="cart-total" class="font-black text-3xl text-ven-primary">0 رس</span>
                                </div>
                                <div class="text-left text-xs text-slate-500">يتضمن ضريبة القيمة المضافة</div>
                            </div>
                            
                            <!-- Points Display -->
                            <div class="bg-gradient-to-r from-slate-800 to-slate-900 p-4 rounded-xl border border-slate-700 mt-6 relative overflow-hidden">
                                <div class="absolute -right-4 -bottom-4 opacity-10 text-6xl text-yellow-500"><i class="fas fa-star"></i></div>
                                <div class="flex items-start gap-3 relative z-10">
                                    <div class="w-8 h-8 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                        <i class="fas fa-star text-sm"></i>
                                    </div>
                                    <div>
                                        <p class="text-xs text-yellow-200/80 font-medium mb-1">هل تفضل الدفع بالنقاط؟</p>
                                        <p class="font-bold text-yellow-400 text-xl" id="cart-points-total">0 نقطة</p>
                                        <p class="text-[10px] text-slate-400 mt-1">سيتم الخيار في صفحة الدفع</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-8 space-y-3">
                            <button onclick="navigate('checkout')" class="w-full btn-primary py-4 rounded-xl font-bold transition text-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" id="checkout-btn">
                                إتمام الطلب <i class="fas fa-arrow-left text-sm"></i>
                            </button>
                            <button onclick="navigate('products')" class="w-full bg-transparent hover:bg-slate-800 text-slate-300 py-3 rounded-xl font-medium transition text-sm">
                                مواصلة التسوق
                            </button>
                        </div>
                        
                        <!-- Trust Badges -->
                        <div class="flex justify-center gap-4 mt-6 text-slate-500 text-xl">
                            <i class="fab fa-cc-visa hover:text-white transition"></i>
                            <i class="fab fa-cc-mastercard hover:text-white transition"></i>
                            <i class="fab fa-cc-apple-pay hover:text-white transition"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ========================================== -->
        <!-- VIEW: CHECKOUT                             -->
        <!-- ========================================== -->
        <div id="view-checkout" class="view max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <button onclick="navigate('cart')" class="text-slate-400 hover:text-white mb-6 flex items-center gap-2 transition text-sm">
                <i class="fas fa-arrow-right"></i> العودة للسلة
            </button>
            <h2 class="text-3xl font-black mb-8 border-b border-slate-800 pb-4">إتمام الطلب (Checkout)</h2>
            
            <div class="flex flex-col lg:flex-row gap-8">
                <!-- Main Form -->
                <div class="flex-grow space-y-8">
                    
                    <!-- 1. Customer Details & Shipping -->
                    <div class="glass-card p-6 md:p-8">
                        <div class="flex items-center gap-3 mb-6 border-b border-slate-700/50 pb-4">
                            <div class="w-8 h-8 rounded-full bg-ven-primary text-white flex items-center justify-center font-bold">1</div>
                            <h3 class="text-xl font-bold">معلومات الشحن</h3>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label class="block text-sm text-slate-400 mb-1.5 font-medium">الاسم الكامل</label>
                                <input type="text" value="أحمد محمد" class="w-full input-premium rounded-xl p-3">
                            </div>
                            <div>
                                <label class="block text-sm text-slate-400 mb-1.5 font-medium">رقم الجوال</label>
                                <input type="text" value="0501234567" class="w-full input-premium rounded-xl p-3 text-left" dir="ltr">
                            </div>
                            <div>
                                <label class="block text-sm text-slate-400 mb-1.5 font-medium">المدينة</label>
                                <select class="w-full input-premium rounded-xl p-3 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:12px_12px] bg-[position:left_1rem_center]">
                                    <option>الرياض</option>
                                    <option>جدة</option>
                                    <option>الدمام</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm text-slate-400 mb-1.5 font-medium">الحي</label>
                                <input type="text" value="الملقا" class="w-full input-premium rounded-xl p-3">
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-sm text-slate-400 mb-1.5 font-medium">العنوان التفصيلي (الشارع، رقم المبنى)</label>
                                <input type="text" value="شارع الأنس، مبنى 12، شقة 4" class="w-full input-premium rounded-xl p-3">
                            </div>
                        </div>
                    </div>
                    
                    <!-- 2. Payment Method -->
                    <div class="glass-card p-6 md:p-8">
                        <div class="flex items-center gap-3 mb-6 border-b border-slate-700/50 pb-4">
                            <div class="w-8 h-8 rounded-full bg-ven-primary text-white flex items-center justify-center font-bold">2</div>
                            <h3 class="text-xl font-bold">طريقة الدفع</h3>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Cash Option -->
                            <label class="cursor-pointer border-2 border-ven-primary bg-ven-primary/5 rounded-2xl p-5 flex flex-col transition hover:bg-ven-primary/10 relative overflow-hidden group" id="pay-cash-label">
                                <div class="flex justify-between items-start mb-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-6 h-6 rounded-full border-2 border-ven-primary flex items-center justify-center">
                                            <div class="w-3 h-3 bg-ven-primary rounded-full transition-all scale-100" id="cash-radio-dot"></div>
                                        </div>
                                        <span class="font-bold text-lg">الدفع النقدي</span>
                                    </div>
                                    <i class="fas fa-credit-card text-ven-primary text-xl"></i>
                                </div>
                                <input type="radio" name="payment_method" value="CASH" checked class="hidden" onchange="updateCheckoutMethod()">
                                <div class="mt-auto pt-4 border-t border-slate-700/50">
                                    <div class="text-xs text-slate-400 mb-1">المبلغ المطلوب خصمه:</div>
                                    <div class="font-black text-2xl text-white" id="checkout-cash-amount">0 رس</div>
                                    <div class="text-[10px] text-green-400 mt-1 flex items-center gap-1"><i class="fas fa-gift"></i> ستكسب نقاط مكافأة بعد الدفع</div>
                                </div>
                            </label>

                            <!-- Points Option -->
                            <label class="cursor-pointer border-2 border-slate-700 bg-slate-800/30 rounded-2xl p-5 flex flex-col transition hover:bg-slate-800/60 relative overflow-hidden group" id="pay-points-label">
                                <div class="flex justify-between items-start mb-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-6 h-6 rounded-full border-2 border-slate-600 flex items-center justify-center">
                                            <div class="w-3 h-3 bg-yellow-400 rounded-full transition-all scale-0" id="points-radio-dot"></div>
                                        </div>
                                        <span class="font-bold text-lg">الدفع بالنقاط</span>
                                    </div>
                                    <i class="fas fa-star text-yellow-400 text-xl"></i>
                                </div>
                                <input type="radio" name="payment_method" value="POINTS" class="hidden" onchange="updateCheckoutMethod()">
                                <div class="mt-auto pt-4 border-t border-slate-700/50">
                                    <div class="text-xs text-slate-400 mb-1">النقاط المطلوبة:</div>
                                    <div class="font-black text-2xl text-yellow-400" id="checkout-points-amount">0 نقطة</div>
                                    <div class="text-[10px] text-slate-400 mt-1 bg-slate-900/50 p-1.5 rounded inline-block">رصيدك الحالي: <strong class="text-white" id="checkout-user-points">0</strong> نقطة</div>
                                </div>
                                
                                <!-- Insufficient overlay -->
                                <div id="insufficient-points-overlay" class="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px] flex items-center justify-center hidden">
                                    <div class="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                                        <i class="fas fa-lock"></i> رصيد النقاط غير كافٍ
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- 3. Referral Code -->
                    <div class="glass-card p-6 md:p-8">
                        <div class="flex items-center gap-3 mb-4">
                            <i class="fas fa-user-friends text-ven-accent text-xl"></i>
                            <h3 class="text-xl font-bold">لديك كود إحالة؟ (Referral)</h3>
                        </div>
                        <p class="text-sm text-slate-400 mb-4">أدخل كود الإحالة من صديقك لتربح نقاط إضافية على هذا الطلب!</p>
                        
                        <div class="flex flex-col sm:flex-row gap-3">
                            <input type="text" id="referral-input" placeholder="أدخل الكود (مثال: VEN-XYZ)" class="flex-grow input-premium rounded-xl p-3 uppercase font-mono text-center sm:text-left" dir="ltr">
                            <button onclick="applyReferral()" class="bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white px-8 py-3 rounded-xl font-bold transition whitespace-nowrap">
                                تطبيق الكود
                            </button>
                        </div>
                        
                        <!-- Referral Success Message -->
                        <div id="referral-msg" class="hidden mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3">
                            <div class="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0"><i class="fas fa-check"></i></div>
                            <div>
                                <div class="font-bold text-green-400 mb-1">تم تفعيل كود الإحالة بنجاح!</div>
                                <div class="text-xs text-slate-300 leading-relaxed">تهانينا! سيتم إضافة <strong class="text-yellow-400">500 نقطة</strong> إلى حسابك فور تأكيد هذا الطلب، وسيحصل صديقك على مكافأته.</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Checkout Sidebar Summary -->
                <div class="w-full lg:w-[400px] shrink-0">
                    <div class="glass-card p-6 sticky top-28 border-ven-primary/30">
                        <h3 class="text-xl font-bold mb-6">المراجعة النهائية</h3>
                        
                        <!-- Mini Cart List -->
                        <div class="space-y-3 mb-6 max-h-48 overflow-y-auto hide-scrollbar pr-2" id="checkout-items-list">
                            <!-- Injected via JS -->
                        </div>
                        
                        <div class="border-t border-slate-700/50 pt-4 mb-6 space-y-3">
                            <div class="flex justify-between text-sm text-slate-300">
                                <span>المنتجات (<span id="checkout-item-count">0</span>)</span>
                                <span id="checkout-subtotal-val">0 رس</span>
                            </div>
                            <div class="flex justify-between text-sm text-slate-300">
                                <span>الضريبة (15%)</span>
                                <span id="checkout-tax-val">0 رس</span>
                            </div>
                            <div class="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700 mt-2">
                                <span class="font-bold text-white text-lg">الإجمالي النهائي</span>
                                <span id="checkout-final-total" class="font-black text-2xl text-ven-primary">0 رس</span>
                            </div>
                        </div>
                        
                        <button onclick="placeOrder()" class="w-full btn-primary py-4 rounded-xl font-bold transition text-lg flex justify-center items-center gap-2 shadow-[0_10px_20px_-10px_rgba(139,92,246,0.6)]" id="place-order-btn">
                            <i class="fas fa-lock text-sm"></i> تأكيد ودفع الطلب
                        </button>
                        
                        <div class="flex items-center justify-center gap-2 mt-4 text-xs text-slate-500">
                            <i class="fas fa-shield-check"></i> عملية دفع آمنة ومشفرة بالكامل 256-bit
                        </div>
                    </div>
                </div>
            </div>
        </div>

"""

with open('generate_prototype_part4.py', 'w') as f:
    f.write('''
views_html3 = """
        <!-- ========================================== -->
        <!-- VIEW: ORDER SUCCESS & TRACKING             -->
        <!-- ========================================== -->
        <div id="view-tracking" class="view max-w-4xl mx-auto px-4">
            <div class="glass-card p-8 md:p-16 text-center border-t-4 border-t-green-500 relative overflow-hidden">
                <!-- Confetti effect base -->
                <div class="absolute inset-0 pointer-events-none opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iIzEwYjk4MSIvPjwvc3ZnPg==')]"></div>
                
                <div class="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(16,185,129,0.4)] relative z-10">
                    <i class="fas fa-check text-5xl text-white"></i>
                </div>
                
                <h2 class="text-4xl font-black mb-3">تم استلام طلبك بنجاح!</h2>
                <p class="text-slate-400 text-lg mb-2">شكراً لتسوقك من Ven+. تم تأكيد طلبك وجاري العمل على تجهيزه.</p>
                <div class="inline-block bg-slate-900 border border-slate-700 px-6 py-2 rounded-lg font-mono text-xl text-ven-accent font-bold mb-12 shadow-inner">
                    رقم الطلب: <span id="tracking-order-id">#ORD-0000</span>
                </div>

                <!-- Beautiful Order Timeline -->
                <div class="max-w-2xl mx-auto bg-slate-900/50 rounded-2xl p-8 border border-slate-800 text-right relative z-10">
                    <h3 class="font-bold text-xl mb-8 text-center border-b border-slate-700/50 pb-4">حالة الطلب</h3>
                    
                    <div class="relative">
                        <!-- Vertical Line -->
                        <div class="absolute right-[19px] top-2 bottom-2 w-1 bg-slate-800 rounded-full"></div>
                        <div class="absolute right-[19px] top-2 h-[20%] w-1 bg-ven-primary rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]"></div>
                        
                        <!-- Step 1: Active -->
                        <div class="relative pr-14 mb-10">
                            <div class="absolute right-0 top-0.5 w-10 h-10 bg-slate-900 border-2 border-ven-primary rounded-full z-10 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                                <div class="w-4 h-4 bg-ven-primary rounded-full"></div>
                            </div>
                            <h4 class="font-bold text-white text-lg mb-1">تم استلام الطلب</h4>
                            <p class="text-sm text-slate-400">تاريخ: <span id="tracking-date">اليوم</span></p>
                        </div>
                        
                        <!-- Step 2: Inactive -->
                        <div class="relative pr-14 mb-10 opacity-60">
                            <div class="absolute right-0 top-0.5 w-10 h-10 bg-slate-900 border-2 border-slate-700 rounded-full z-10 flex items-center justify-center">
                                <div class="w-3 h-3 bg-slate-600 rounded-full"></div>
                            </div>
                            <h4 class="font-bold text-white text-lg mb-1">قيد التجهيز</h4>
                            <p class="text-sm text-slate-400">يتم تجميع وتغليف منتجاتك بعناية.</p>
                        </div>

                        <!-- Step 3: Inactive -->
                        <div class="relative pr-14 mb-10 opacity-60">
                            <div class="absolute right-0 top-0.5 w-10 h-10 bg-slate-900 border-2 border-slate-700 rounded-full z-10 flex items-center justify-center">
                                <div class="w-3 h-3 bg-slate-600 rounded-full"></div>
                            </div>
                            <h4 class="font-bold text-white text-lg mb-1">تم الشحن</h4>
                            <p class="text-sm text-slate-400">الطلب في طريقه إليك عبر شركة الشحن.</p>
                        </div>

                        <!-- Step 4: Inactive -->
                        <div class="relative pr-14 opacity-60">
                            <div class="absolute right-0 top-0.5 w-10 h-10 bg-slate-900 border-2 border-slate-700 rounded-full z-10 flex items-center justify-center">
                                <i class="fas fa-home text-slate-600 text-sm"></i>
                            </div>
                            <h4 class="font-bold text-white text-lg mb-1">تم التسليم</h4>
                            <p class="text-sm text-slate-400">وصل الطلب إلى عنوانك المحدد.</p>
                        </div>
                    </div>
                </div>

                <div class="mt-12 flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                    <button onclick="navigate('products')" class="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-8 py-4 rounded-xl font-bold transition text-lg">
                        متابعة التسوق
                    </button>
                    <button onclick="navigate('account')" class="btn-primary px-8 py-4 rounded-xl font-bold transition text-lg shadow-[0_10px_20px_-10px_rgba(139,92,246,0.6)]">
                        الذهاب إلى حسابي <i class="fas fa-arrow-left ml-2"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- ========================================== -->
        <!-- VIEW: ACCOUNT (Points & Referral)          -->
        <!-- ========================================== -->
        <div id="view-account" class="view max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-black mb-8 border-b border-slate-800 pb-4">حسابي الشخصي</h2>
            
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <!-- Sidebar -->
                <div class="lg:col-span-4 space-y-6">
                    
                    <!-- Profile Card -->
                    <div class="glass-card p-6 text-center">
                        <div class="relative inline-block mb-4">
                            <div class="w-28 h-28 bg-gradient-to-tr from-ven-primary to-ven-accent rounded-full mx-auto p-1 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                                <div class="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-4xl font-black text-white">أم</div>
                            </div>
                            <button class="absolute bottom-0 right-0 w-8 h-8 bg-slate-800 border border-slate-600 rounded-full flex items-center justify-center text-xs hover:bg-slate-700 transition">
                                <i class="fas fa-camera"></i>
                            </button>
                        </div>
                        <h3 class="text-2xl font-bold mb-1 text-white" id="account-name">أحمد محمد</h3>
                        <p class="text-slate-400 text-sm mb-6 font-mono">ahmed@example.com</p>
                        
                        <div class="bg-slate-900 rounded-xl p-1 mb-2">
                            <button class="w-full bg-slate-800 text-white font-bold py-2.5 rounded-lg text-sm">الملف الشخصي</button>
                        </div>
                        <div class="bg-slate-900 rounded-xl p-1 mb-2">
                            <button class="w-full text-slate-400 hover:bg-slate-800 hover:text-white font-medium py-2.5 rounded-lg text-sm transition">العناوين المحفوظة</button>
                        </div>
                        <div class="bg-slate-900 rounded-xl p-1 border border-red-900/30">
                            <button class="w-full text-red-400 hover:bg-red-900/20 font-medium py-2.5 rounded-lg text-sm transition">تسجيل الخروج</button>
                        </div>
                    </div>

                    <!-- Points Card -->
                    <div class="glass-card p-6 relative overflow-hidden group">
                        <div class="absolute -right-8 -top-8 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl group-hover:bg-yellow-500/20 transition-all"></div>
                        <div class="relative z-10">
                            <div class="flex items-center gap-2 mb-2 text-yellow-500">
                                <i class="fas fa-star"></i>
                                <h3 class="font-bold text-sm">محفظة النقاط (Ven+ Points)</h3>
                            </div>
                            <div class="text-4xl font-black text-white mb-1" id="account-points-display">0</div>
                            <p class="text-xs text-slate-400 mb-4">نقاط قابلة للاستبدال في أي وقت</p>
                            
                            <button onclick="navigate('products')" class="w-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 py-2.5 rounded-lg font-bold text-sm transition flex justify-center items-center gap-2">
                                تصفح منتجات النقاط <i class="fas fa-arrow-left text-xs"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Referral Program Card (CRITICAL) -->
                    <div class="glass-card p-6 border-ven-primary/40 shadow-[0_0_30px_rgba(139,92,246,0.1)] relative overflow-hidden">
                        <div class="absolute inset-0 bg-gradient-to-br from-ven-primary/10 to-transparent"></div>
                        <div class="relative z-10">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="font-bold text-lg text-white flex items-center gap-2"><i class="fas fa-gift text-ven-accent"></i> برنامج الإحالة</h3>
                                <span class="bg-ven-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">نشط</span>
                            </div>
                            
                            <p class="text-sm text-slate-300 mb-5 leading-relaxed">
                                شارك الكود الخاص بك. سيحصل صديقك على خصم مميز، وتحصل أنت على <strong class="text-yellow-400 bg-slate-900 px-1 rounded">1000 نقطة</strong> فور إتمامه لأول طلب!
                            </p>
                            
                            <div class="mb-2 text-xs text-slate-400 font-medium">كود الإحالة الخاص بك:</div>
                            <div class="bg-slate-900 border-2 border-slate-700 hover:border-ven-primary rounded-xl p-4 flex justify-between items-center cursor-pointer transition group" onclick="copyReferral()">
                                <span class="font-mono text-xl text-ven-accent tracking-widest font-black" id="account-referral-code">VEN-XYZ</span>
                                <div class="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-ven-primary group-hover:bg-ven-primary/10 transition">
                                    <i class="fas fa-copy"></i>
                                </div>
                            </div>
                            <div class="text-[10px] text-center text-slate-500 mt-2">اضغط على الكود للنسخ</div>
                        </div>
                    </div>
                </div>

                <!-- Main Content (Orders History) -->
                <div class="lg:col-span-8">
                    <div class="glass-card p-6 md:p-8 min-h-full">
                        <div class="flex justify-between items-center mb-8 border-b border-slate-700/50 pb-4">
                            <h3 class="text-2xl font-bold">سجل الطلبات</h3>
                            <div class="flex gap-2">
                                <select class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 outline-none focus:border-ven-primary">
                                    <option>آخر 30 يوم</option>
                                    <option>آخر 6 شهور</option>
                                    <option>الكل</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="space-y-4" id="account-orders-container">
                            <!-- Injected via JS -->
                        </div>
                    </div>
                </div>
            </div>
        </div>

"""

with open('generate_prototype_part5.py', 'w') as f:
    f.write('''
views_html4 = """
        <!-- ========================================== -->
        <!-- VIEW: ADMIN DASHBOARD                      -->
        <!-- ========================================== -->
        <div id="view-admin" class="view max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
                <!-- Admin Header -->
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-slate-800">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <div>
                            <h2 class="text-3xl font-black text-white">لوحة الإدارة (Admin)</h2>
                            <p class="text-slate-400 text-sm mt-1">نظرة شاملة على أداء المتجر والمبيعات الحية</p>
                        </div>
                    </div>
                    <div class="mt-4 md:mt-0 flex gap-3">
                        <button class="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 border border-slate-700">
                            <i class="fas fa-download"></i> تقرير
                        </button>
                        <button onclick="navigate('home')" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-lg">
                            العودة للمتجر <i class="fas fa-external-link-alt"></i>
                        </button>
                    </div>
                </div>

                <!-- KPI Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <!-- Sales -->
                    <div class="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 relative overflow-hidden group">
                        <div class="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                        <div class="flex justify-between items-start mb-4">
                            <div class="text-slate-400 text-xs font-bold uppercase tracking-wider">إجمالي المبيعات (نقد)</div>
                            <div class="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center"><i class="fas fa-wallet"></i></div>
                        </div>
                        <div class="text-3xl font-black text-white mb-2" id="admin-kpi-sales">0 رس</div>
                        <div class="text-xs text-green-400 font-medium flex items-center gap-1"><i class="fas fa-arrow-trend-up"></i> +12.5% من الشهر الماضي</div>
                    </div>
                    
                    <!-- Orders -->
                    <div class="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 relative overflow-hidden">
                        <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                        <div class="flex justify-between items-start mb-4">
                            <div class="text-slate-400 text-xs font-bold uppercase tracking-wider">إجمالي الطلبات</div>
                            <div class="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center"><i class="fas fa-box"></i></div>
                        </div>
                        <div class="text-3xl font-black text-white mb-2" id="admin-kpi-orders">0</div>
                        <div class="text-xs text-slate-400 font-medium">قيد المعالجة: <span class="text-white" id="admin-kpi-pending">0</span></div>
                    </div>

                    <!-- Customers -->
                    <div class="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 relative overflow-hidden">
                        <div class="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                        <div class="flex justify-between items-start mb-4">
                            <div class="text-slate-400 text-xs font-bold uppercase tracking-wider">قاعدة العملاء</div>
                            <div class="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center"><i class="fas fa-users"></i></div>
                        </div>
                        <div class="text-3xl font-black text-white mb-2" id="admin-kpi-customers">0</div>
                        <div class="text-xs text-indigo-400 font-medium flex items-center gap-1"><i class="fas fa-arrow-trend-up"></i> +4 تسجيل جديد</div>
                    </div>

                    <!-- Points -->
                    <div class="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 relative overflow-hidden">
                        <div class="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500"></div>
                        <div class="flex justify-between items-start mb-4">
                            <div class="text-slate-400 text-xs font-bold uppercase tracking-wider">النقاط المصدرة للولاء</div>
                            <div class="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center"><i class="fas fa-star"></i></div>
                        </div>
                        <div class="text-3xl font-black text-yellow-400 mb-2" id="admin-kpi-points">0</div>
                        <div class="text-xs text-slate-400 font-medium">المدفوع بالنقاط: <span class="text-white" id="admin-kpi-points-spent">0</span></div>
                    </div>
                </div>

                <!-- Main Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Chart Section -->
                    <div class="lg:col-span-2 bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="font-bold text-lg">تحليل الإيرادات (آخر 7 أيام)</h3>
                            <select class="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs outline-none">
                                <option>هذا الأسبوع</option>
                                <option>هذا الشهر</option>
                            </select>
                        </div>
                        <div class="h-80 w-full" dir="ltr">
                            <canvas id="adminSalesChart"></canvas>
                        </div>
                    </div>

                    <!-- Top Products -->
                    <div class="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
                        <h3 class="font-bold text-lg mb-6">المنتجات الأكثر مبيعاً</h3>
                        <div class="space-y-4" id="admin-top-products">
                            <!-- Injected via JS -->
                        </div>
                    </div>
                </div>

                <!-- Orders Table -->
                <div class="mt-8 bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
                    <div class="p-6 border-b border-slate-700/50 flex justify-between items-center">
                        <h3 class="font-bold text-lg">أحدث الطلبات</h3>
                        <div class="relative w-64">
                            <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                            <input type="text" placeholder="بحث برقم الطلب..." class="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 pr-8 pl-3 text-sm focus:outline-none focus:border-indigo-500">
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-right">
                            <thead class="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-700/50">
                                <tr>
                                    <th class="px-6 py-4 font-bold">رقم الطلب</th>
                                    <th class="px-6 py-4 font-bold">العميل</th>
                                    <th class="px-6 py-4 font-bold">التاريخ</th>
                                    <th class="px-6 py-4 font-bold">المنتجات</th>
                                    <th class="px-6 py-4 font-bold">الإجمالي</th>
                                    <th class="px-6 py-4 font-bold">الدفع</th>
                                    <th class="px-6 py-4 font-bold">الحالة</th>
                                </tr>
                            </thead>
                            <tbody id="admin-orders-table-body" class="divide-y divide-slate-700/50">
                                <!-- Injected via JS -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

    </main>

    <!-- MOBILE BOTTOM NAVIGATION -->
    <div class="fixed bottom-0 left-0 w-full glass z-[90] md:hidden flex justify-around py-2 pb-safe border-t border-slate-800 shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
        <button onclick="navigate('home')" class="nav-btn flex flex-col items-center justify-center w-16 h-12 text-slate-400 transition" data-target="home">
            <i class="fas fa-home text-lg mb-1"></i>
            <span class="text-[10px] font-bold">الرئيسية</span>
        </button>
        <button onclick="navigate('products')" class="nav-btn flex flex-col items-center justify-center w-16 h-12 text-slate-400 transition" data-target="products">
            <i class="fas fa-border-all text-lg mb-1"></i>
            <span class="text-[10px] font-bold">المتجر</span>
        </button>
        <button onclick="navigate('cart')" class="nav-btn flex flex-col items-center justify-center w-16 h-12 text-slate-400 transition relative" data-target="cart">
            <div class="relative">
                <i class="fas fa-shopping-cart text-lg mb-1"></i>
                <span class="absolute -top-1.5 -right-2.5 bg-ven-primary text-white text-[9px] rounded-full w-[16px] h-[16px] flex items-center justify-center font-bold border border-slate-900" id="mobile-cart-badge">0</span>
            </div>
            <span class="text-[10px] font-bold">السلة</span>
        </button>
        <button onclick="navigate('account')" class="nav-btn flex flex-col items-center justify-center w-16 h-12 text-slate-400 transition" data-target="account">
            <i class="fas fa-user text-lg mb-1"></i>
            <span class="text-[10px] font-bold">حسابي</span>
        </button>
    </div>

    <!-- TOAST CONTAINER -->
    <div id="toast-container"></div>
"""

with open('generate_prototype_part6.py', 'w') as f:
    f.write('''
js_script = """
    <script>
        // ==========================================
        // STATE MANAGEMENT & DEMO DATA
        // ==========================================
        const DEMO_PRODUCTS = [
            { id: 1, name: 'آيفون 16 برو ماكس - 256 جيجا، تيتانيوم أسود', price: 5099, pointsPrice: 50990, category: 'هواتف ذكية', rating: 4.9, reviews: 342, img: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=800&auto=format&fit=crop', desc: 'أحدث إصدار بتصميم التيتانيوم القوي والخفيف، مع نظام كاميرات احترافي ومعالج A18 Pro الجبار.', oldPrice: 5299, stock: 12, isNew: true },
            { id: 2, name: 'سماعات سوني WH-1000XM5 عازلة للضوضاء', price: 1399, pointsPrice: 13990, category: 'صوتيات', rating: 4.8, reviews: 856, img: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop', desc: 'أفضل تقنية لعزل الضوضاء في فئتها، جودة صوت استثنائية، وبطارية تدوم حتى 30 ساعة مع الشحن السريع.', oldPrice: 1599, stock: 45, isNew: false },
            { id: 3, name: 'ماك بوك برو 14 إنش - شريحة M3 Pro', price: 8499, pointsPrice: 84990, category: 'أجهزة كمبيوتر', rating: 5.0, reviews: 120, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop', desc: 'قوة هائلة للمحترفين. شاشة Liquid Retina XDR مذهلة، وعمر بطارية أطول من أي وقت مضى.', oldPrice: None, stock: 8, isNew: true },
            { id: 4, name: 'ساعة آبل الذكية الإصدار 9', price: 1799, pointsPrice: 17990, category: 'إلكترونيات', rating: 4.7, reviews: 432, img: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?q=80&w=800&auto=format&fit=crop', desc: 'شريحة أقوى، شاشة أكثر سطوعاً بمرتين، وحركة "الضغط المزدوج" السحرية الجديدة للتحكم بالساعة.', oldPrice: 1899, stock: 20, isNew: false },
            { id: 5, name: 'بلايستيشن 5 سليم - نسخة الأقراص', price: 2099, pointsPrice: 20990, category: 'ألعاب', rating: 4.9, reviews: 1500, img: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=800&auto=format&fit=crop', desc: 'تصميم أنحف وأخف مع مساحة تخزين 1 تيرا بايت وذراع تحكم DualSense لتجربة لعب غامرة.', oldPrice: 2299, stock: 3, isNew: false },
            { id: 6, name: 'شاشة ألعاب منحنية 34 إنش OLED', price: 3499, pointsPrice: 34990, category: 'ألعاب', rating: 4.6, reviews: 89, img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800&auto=format&fit=crop', desc: 'معدل تحديث 175 هرتز وزمن استجابة 0.1 مللي ثانية لتجربة لعب فائقة السلاسة مع ألوان OLED مذهلة.', oldPrice: None, stock: 15, isNew: true },
        ];

        let state = {
            view: 'home',
            user: {
                name: 'أحمد محمد',
                email: 'ahmed@example.com',
                points: 3500,
                referralCode: 'VEN-2026',
            },
            cart: [],
            orders: [],
            selectedProductId: 1,
            selectedQuantity: 1, // pd quantity state
            checkout: {
                method: 'CASH', // CASH | POINTS
                referralApplied: false,
                referralBonusAmount: 500,
            },
            admin: {
                totalSales: 85400,
                ordersCount: 34,
                customers: 128,
                pointsIssued: 450000,
                pointsSpent: 12500,
                topProducts: [
                    { id: 1, name: 'آيفون 16 برو ماكس', sold: 12, rev: 61188 },
                    { id: 2, name: 'سماعات سوني WH-1000XM5', sold: 8, rev: 11192 },
                    { id: 5, name: 'بلايستيشن 5 سليم', sold: 5, rev: 10495 },
                ],
                recentOrders: [
                    { id: 'ORD-8432', customer: 'خالد عبدلله', date: 'منذ ساعتين', items: 2, total: 3498, method: 'CASH', status: 'Pending' },
                    { id: 'ORD-8431', customer: 'سارة فهد', date: 'اليوم', items: 1, total: 1799, method: 'POINTS', status: 'Processing' },
                    { id: 'ORD-8430', customer: 'عمر خالد', date: 'أمس', items: 3, total: 4997, method: 'CASH', status: 'Shipped' },
                ]
            }
        };

        let salesChartInstance = null;

        // ==========================================
        // UTILS
        // ==========================================
        const fmtMoney = (val) => val.toLocaleString('ar-SA') + ' رس';
        const fmtPoints = (val) => val.toLocaleString('ar-SA') + ' نقطة';
        
        function showToast(message, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = `toast ${type === 'error' ? 'error' : ''}`;
            
            const icon = type === 'success' 
                ? '<div class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0"><i class="fas fa-check text-xs"></i></div>' 
                : '<div class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0"><i class="fas fa-exclamation text-xs"></i></div>';
            
            toast.innerHTML = `${icon} <span>${message}</span>`;
            container.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'fadeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
                setTimeout(() => toast.remove(), 300);
            }, 4000);
        }

        // ==========================================
        // CART LOGIC
        // ==========================================
        function getCartTotals() {
            const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const subtotalPoints = state.cart.reduce((sum, item) => sum + (item.pointsPrice * item.quantity), 0);
            const tax = subtotal * 0.15; // Included in price theoretically, but let's show it extracted for UX
            return { subtotal, tax, total: subtotal, subtotalPoints }; // Assume price is tax inclusive as per GCC standard
        }

        function updateCartBadges() {
            const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
            document.getElementById('header-cart-badge').textContent = count;
            document.getElementById('mobile-cart-badge').textContent = count;
            document.getElementById('demo-cart-badge').textContent = `(${count})`;
            
            if(count > 0) {
                document.getElementById('header-cart-badge').classList.add('animate-pulse');
                setTimeout(() => document.getElementById('header-cart-badge').classList.remove('animate-pulse'), 1000);
            }
        }

        function addToCart(productId, quantity = 1) {
            const product = DEMO_PRODUCTS.find(p => p.id === productId);
            if(!product) return;
            
            const existing = state.cart.find(item => item.id === productId);
            if (existing) {
                existing.quantity += quantity;
            } else {
                state.cart.push({ ...product, quantity });
            }
            
            updateCartBadges();
            showToast(`تمت إضافة ${product.name} للسلة`);
            
            // If in cart view, re-render
            if(state.view === 'cart') renderCart();
        }

        function removeFromCart(productId) {
            state.cart = state.cart.filter(item => item.id !== productId);
            updateCartBadges();
            renderCart();
            showToast('تم إزالة المنتج من السلة');
        }

        function updateCartItemQty(productId, delta) {
            const item = state.cart.find(i => i.id === productId);
            if(item) {
                const newQty = item.quantity + delta;
                if(newQty <= 0) {
                    removeFromCart(productId);
                } else {
                    item.quantity = newQty;
                    renderCart();
                }
                updateCartBadges();
            }
        }

        // ==========================================
        // CHECKOUT LOGIC
        // ==========================================
        function updateCheckoutMethod() {
            const method = document.querySelector('input[name="payment_method"]:checked').value;
            state.checkout.method = method;
            
            const cashLabel = document.getElementById('pay-cash-label');
            const pointsLabel = document.getElementById('pay-points-label');
            const cashDot = document.getElementById('cash-radio-dot');
            const pointsDot = document.getElementById('points-radio-dot');
            
            if(method === 'CASH') {
                cashLabel.classList.replace('border-slate-700', 'border-ven-primary');
                cashLabel.classList.replace('bg-slate-800/30', 'bg-ven-primary/5');
                cashDot.classList.replace('scale-0', 'scale-100');
                
                pointsLabel.classList.replace('border-ven-primary', 'border-slate-700');
                pointsLabel.classList.replace('bg-ven-primary/5', 'bg-slate-800/30');
                pointsDot.classList.replace('scale-100', 'scale-0');
            } else {
                pointsLabel.classList.replace('border-slate-700', 'border-ven-primary');
                pointsLabel.classList.replace('bg-slate-800/30', 'bg-ven-primary/5');
                pointsDot.classList.replace('scale-0', 'scale-100');
                
                cashLabel.classList.replace('border-ven-primary', 'border-slate-700');
                cashLabel.classList.replace('bg-ven-primary/5', 'bg-slate-800/30');
                cashDot.classList.replace('scale-100', 'scale-0');
            }
            
            renderCheckoutSummary();
        }

        function applyReferral() {
            const input = document.getElementById('referral-input').value.trim().toUpperCase();
            if(!input) return;
            if(input === state.user.referralCode) {
                showToast('لا يمكنك استخدام كود الإحالة الخاص بك', 'error');
                return;
            }
            if(!input.startsWith('VEN-')) {
                showToast('كود إحالة غير صحيح', 'error');
                return;
            }
            
            state.checkout.referralApplied = true;
            document.getElementById('referral-msg').classList.remove('hidden');
            document.getElementById('referral-input').disabled = true;
            showToast('تم تطبيق الكود بنجاح!');
        }

        function placeOrder() {
            if(state.cart.length === 0) return;
            
            const btn = document.getElementById('place-order-btn');
            btn.innerHTML = '<div class="loader"></div> جاري المعالجة...';
            btn.disabled = true;

            setTimeout(() => {
                const totals = getCartTotals();
                
                // Process Payment
                if(state.checkout.method === 'POINTS') {
                    state.user.points -= totals.subtotalPoints;
                    state.admin.pointsSpent += totals.subtotalPoints;
                } else {
                    const pointsEarned = Math.floor(totals.total * 0.1); // 10% back in points as demo logic
                    state.user.points += pointsEarned;
                    state.admin.pointsIssued += pointsEarned;
                    state.admin.totalSales += totals.total;
                }

                // Process Referral Bonus
                if(state.checkout.referralApplied) {
                    state.user.points += state.checkout.referralBonusAmount;
                    state.admin.pointsIssued += state.checkout.referralBonusAmount;
                }

                // Create Order Record
                const orderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
                const order = {
                    id: orderId,
                    date: new Date().toLocaleDateString('ar-SA'),
                    total: state.checkout.method === 'CASH' ? fmtMoney(totals.total) : fmtPoints(totals.subtotalPoints),
                    itemsCount: state.cart.reduce((sum, item) => sum + item.quantity, 0),
                    status: 'Processing',
                    method: state.checkout.method
                };
                
                state.orders.unshift(order);
                state.admin.ordersCount++;
                state.admin.recentOrders.unshift({
                    id: orderId, customer: state.user.name, date: 'الآن', items: order.itemsCount, total: totals.total, method: order.method, status: 'Pending'
                });
                
                // Clear Cart & Reset
                state.cart = [];
                state.checkout.referralApplied = false;
                
                updateCartBadges();
                updateGlobalPoints();
                
                // Navigate to Success
                document.getElementById('tracking-order-id').textContent = '#' + orderId;
                document.getElementById('tracking-date').textContent = new Date().toLocaleDateString('ar-SA');
                navigate('tracking');
                
                btn.innerHTML = '<i class="fas fa-lock text-sm"></i> تأكيد ودفع الطلب';
                btn.disabled = false;
                
            }, 800); // Simulate network latency
        }

        // ==========================================
        // RENDERERS
        // ==========================================
        
        function updateGlobalPoints() {
            document.getElementById('header-points').textContent = state.user.points.toLocaleString('en-US');
            if(document.getElementById('account-points-display')) {
                document.getElementById('account-points-display').textContent = state.user.points.toLocaleString('en-US');
            }
        }

        // --- Render Home ---
        function renderHome() {
            const grid = document.getElementById('home-products-grid');
            grid.innerHTML = DEMO_PRODUCTS.slice(0,4).map(p => createProductCard(p)).join('');
        }

        // --- Render Products Listing ---
        function renderProducts() {
            const grid = document.getElementById('products-listing-grid');
            grid.innerHTML = DEMO_PRODUCTS.map(p => createProductCard(p)).join('');
        }

        function createProductCard(p) {
            const discountTag = p.oldPrice ? `<div class="absolute top-3 right-3 bg-ven-primary text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg border border-ven-primaryDark z-10">خصم ${Math.round((1 - p.price/p.oldPrice)*100)}%</div>` : '';
            const newTag = p.isNew ? `<div class="absolute top-3 left-3 bg-slate-900/80 backdrop-blur text-ven-accent text-[10px] font-bold px-2 py-1 rounded-full border border-slate-700 z-10">جديد</div>` : '';
            const oldPriceHtml = p.oldPrice ? `<span class="text-xs text-slate-500 line-through mr-2">${fmtMoney(p.oldPrice)}</span>` : '';
            
            return `
                <div class="glass-card overflow-hidden hover-lift flex flex-col group h-full">
                    <div class="relative aspect-[4/3] overflow-hidden bg-slate-900 cursor-pointer" onclick="openProduct(${p.id})">
                        ${discountTag}
                        ${newTag}
                        <img src="${p.img}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700 opacity-90 group-hover:opacity-100">
                        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent h-1/2 opacity-60"></div>
                        <button class="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-slate-900/50 backdrop-blur border border-slate-700 flex items-center justify-center text-slate-300 hover:text-rose-400 hover:bg-slate-900 transition z-10">
                            <i class="far fa-heart text-sm"></i>
                        </button>
                    </div>
                    <div class="p-4 sm:p-5 flex flex-col flex-grow bg-slate-800/30">
                        <div class="text-[10px] text-slate-400 font-medium mb-1.5">${p.category}</div>
                        <h3 class="font-bold text-sm mb-2 line-clamp-2 cursor-pointer hover:text-ven-accent transition leading-snug" onclick="openProduct(${p.id})">${p.name}</h3>
                        <div class="flex items-center gap-1 text-[10px] text-slate-500 mb-3">
                            <i class="fas fa-star text-yellow-500"></i> <span class="text-slate-300 font-bold">${p.rating}</span> (${p.reviews})
                        </div>
                        <div class="mt-auto pt-4 border-t border-slate-700/50">
                            <div class="flex items-end">
                                <span class="font-black text-lg text-white">${fmtMoney(p.price)}</span>
                                ${oldPriceHtml}
                            </div>
                            <div class="text-[10px] text-yellow-400/80 mt-1 flex items-center gap-1 font-medium"><i class="fas fa-star text-[8px]"></i> ${fmtPoints(p.pointsPrice)}</div>
                        </div>
                        <button onclick="addToCart(${p.id})" class="w-full mt-4 bg-slate-800 hover:bg-ven-primary border border-slate-600 hover:border-ven-primary text-white py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                            <i class="fas fa-cart-plus"></i> أضف للسلة
                        </button>
                    </div>
                </div>
            `;
        }

        // --- Render Product Details ---
        function openProduct(id) {
            state.selectedProductId = id;
            state.selectedQuantity = 1;
            navigate('product-details');
        }

        function changePDQuantity(delta) {
            const newQty = state.selectedQuantity + delta;
            if(newQty >= 1 && newQty <= 10) {
                state.selectedQuantity = newQty;
                document.getElementById('pd-qty').textContent = state.selectedQuantity;
            }
        }

        function addToCartFromPD() {
            addToCart(state.selectedProductId, state.selectedQuantity);
            state.selectedQuantity = 1; // reset
            document.getElementById('pd-qty').textContent = state.selectedQuantity;
        }

        function buyNowFromPD() {
            addToCart(state.selectedProductId, state.selectedQuantity);
            navigate('checkout');
        }

        function renderProductDetails() {
            const p = DEMO_PRODUCTS.find(prod => prod.id === state.selectedProductId);
            if(!p) { navigate('products'); return; }
            
            document.getElementById('pd-name-bc').textContent = p.name;
            document.getElementById('pd-category-bc').textContent = p.category;
            document.getElementById('pd-main-img').src = p.img;
            document.getElementById('pd-name').textContent = p.name;
            document.getElementById('pd-rating').textContent = p.rating;
            document.getElementById('pd-reviews').textContent = p.reviews;
            document.getElementById('pd-desc').textContent = p.desc;
            document.getElementById('pd-price').textContent = fmtMoney(p.price);
            document.getElementById('pd-points-price').textContent = fmtPoints(p.pointsPrice);
            document.getElementById('pd-qty').textContent = state.selectedQuantity;
            
            const oldPriceEl = document.getElementById('pd-old-price');
            const discountEl = document.getElementById('pd-discount');
            if(p.oldPrice) {
                oldPriceEl.textContent = fmtMoney(p.oldPrice);
                discountEl.textContent = `خصم ${Math.round((1 - p.price/p.oldPrice)*100)}%`;
                discountEl.classList.remove('hidden');
            } else {
                oldPriceEl.textContent = '';
                discountEl.classList.add('hidden');
            }
            
            const stockBadge = document.getElementById('pd-stock-badge');
            if(p.stock < 5) {
                stockBadge.className = 'bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold w-max border border-red-500/30 mb-4';
                stockBadge.textContent = `تبقى ${p.stock} فقط في المخزون`;
            } else {
                stockBadge.className = 'bg-ven-primary/20 text-ven-accent px-3 py-1 rounded-full text-xs font-bold w-max border border-ven-primary/30 mb-4';
                stockBadge.textContent = 'متوفر في المخزون';
            }
            
            // Thumbnails demo
            document.getElementById('pd-thumbnails').innerHTML = [1,2,3].map(i => `
                <div class="w-20 h-20 rounded-xl overflow-hidden border-2 ${i===1?'border-ven-primary':'border-transparent opacity-50'} cursor-pointer hover:opacity-100 transition shrink-0">
                    <img src="${p.img}" class="w-full h-full object-cover">
                </div>
            `).join('');
        }

        // --- Render Cart ---
        function renderCart() {
            const container = document.getElementById('cart-items-container');
            const btn = document.getElementById('checkout-btn');
            
            if(state.cart.length === 0) {
                container.innerHTML = `
                    <div class="glass-card p-16 text-center text-slate-400 flex flex-col items-center justify-center min-h-[400px]">
                        <div class="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                            <i class="fas fa-shopping-bag text-5xl text-slate-600"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-white mb-3">سلتك فارغة تماماً</h3>
                        <p class="mb-8 max-w-md">استكشف أحدث المنتجات التقنية في متجرنا وأضف ما يعجبك إلى السلة.</p>
                        <button onclick="navigate('products')" class="btn-primary px-8 py-3 rounded-xl font-bold transition shadow-lg flex items-center gap-2">
                            تصفح المتجر <i class="fas fa-arrow-left text-sm"></i>
                        </button>
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
                <div class="glass-card p-5 flex gap-5 items-center relative overflow-hidden group">
                    <div class="w-24 h-24 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-700">
                        <img src="${item.img}" class="w-full h-full object-cover">
                    </div>
                    
                    <div class="flex-grow flex flex-col h-full justify-between py-1">
                        <div>
                            <div class="flex justify-between items-start gap-4 mb-1">
                                <h4 class="font-bold text-base line-clamp-1 text-white pr-6">${item.name}</h4>
                                <button onclick="removeFromCart(${item.id})" class="absolute top-4 left-4 text-slate-500 hover:text-red-400 text-lg transition bg-slate-900/80 w-8 h-8 rounded-full flex items-center justify-center border border-slate-700"><i class="fas fa-times"></i></button>
                            </div>
                            <div class="text-xs text-slate-400">${item.category}</div>
                        </div>
                        
                        <div class="flex flex-wrap justify-between items-end mt-4">
                            <div>
                                <div class="font-black text-lg text-white">${fmtMoney(item.price)}</div>
                                <div class="text-[10px] text-yellow-400/80 mt-0.5 flex items-center gap-1 font-medium"><i class="fas fa-star text-[8px]"></i> ${fmtPoints(item.pointsPrice)}</div>
                            </div>
                            
                            <div class="flex items-center bg-slate-900 rounded-lg border border-slate-700 p-1">
                                <button onclick="updateCartItemQty(${item.id}, -1)" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"><i class="fas fa-minus text-xs"></i></button>
                                <span class="w-10 text-center font-bold text-white">${item.quantity}</span>
                                <button onclick="updateCartItemQty(${item.id}, 1)" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"><i class="fas fa-plus text-xs"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            const totals = getCartTotals();
            document.getElementById('cart-subtotal').textContent = fmtMoney(totals.subtotal);
            document.getElementById('cart-tax').textContent = fmtMoney(totals.tax);
            document.getElementById('cart-total').textContent = fmtMoney(totals.total);
            document.getElementById('cart-points-total').textContent = fmtPoints(totals.subtotalPoints);
        }

        // --- Render Checkout ---
        function renderCheckout() {
            if(state.cart.length === 0) { navigate('cart'); return; }
            
            const totals = getCartTotals();
            document.getElementById('checkout-cash-amount').textContent = fmtMoney(totals.total);
            document.getElementById('checkout-points-amount').textContent = fmtPoints(totals.subtotalPoints);
            document.getElementById('checkout-user-points').textContent = state.user.points.toLocaleString('en-US');
            
            // Render Mini Cart
            const listEl = document.getElementById('checkout-items-list');
            listEl.innerHTML = state.cart.map(item => `
                <div class="flex gap-3 items-center">
                    <div class="w-12 h-12 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-700 relative">
                        <img src="${item.img}" class="w-full h-full object-cover opacity-80">
                        <div class="absolute -top-1 -right-1 bg-slate-700 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-slate-900">${item.quantity}</div>
                    </div>
                    <div class="flex-grow">
                        <div class="text-xs font-bold text-white line-clamp-1">${item.name}</div>
                        <div class="text-[10px] text-slate-400 mt-1">${fmtMoney(item.price)}</div>
                    </div>
                </div>
            `).join('');
            
            // Check Points Balance
            const pointsRadio = document.querySelector('input[value="POINTS"]');
            const pointsLabel = document.getElementById('pay-points-label');
            const overlay = document.getElementById('insufficient-points-overlay');
            
            if(state.user.points < totals.subtotalPoints) {
                pointsRadio.disabled = true;
                overlay.classList.remove('hidden');
                
                state.checkout.method = 'CASH';
                document.querySelector('input[value="CASH"]').checked = true;
            } else {
                pointsRadio.disabled = false;
                overlay.classList.add('hidden');
            }
            
            // Reset Referral UI
            state.checkout.referralApplied = false;
            document.getElementById('referral-input').value = '';
            document.getElementById('referral-input').disabled = false;
            document.getElementById('referral-msg').classList.add('hidden');
            
            updateCheckoutMethod();
        }

        function renderCheckoutSummary() {
            const totals = getCartTotals();
            document.getElementById('checkout-item-count').textContent = state.cart.reduce((sum, item) => sum + item.quantity, 0);
            document.getElementById('checkout-subtotal-val').textContent = fmtMoney(totals.subtotal);
            document.getElementById('checkout-tax-val').textContent = fmtMoney(totals.tax);
            
            const finalEl = document.getElementById('checkout-final-total');
            if(state.checkout.method === 'CASH') {
                finalEl.innerHTML = fmtMoney(totals.total);
                finalEl.className = 'font-black text-2xl text-ven-primary';
            } else {
                finalEl.innerHTML = `${fmtPoints(totals.subtotalPoints)} <i class="fas fa-star text-sm mb-1"></i>`;
                finalEl.className = 'font-black text-xl text-yellow-400 flex items-center gap-1.5';
            }
        }

        // --- Render Account ---
        function renderAccount() {
            document.getElementById('account-points-display').textContent = state.user.points.toLocaleString('en-US');
            
            const ordersContainer = document.getElementById('account-orders-container');
            if(state.orders.length === 0) {
                ordersContainer.innerHTML = `
                    <div class="text-center py-12 text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
                        <i class="fas fa-box-open text-4xl mb-3 opacity-50"></i>
                        <p class="text-sm">لم تقم بإجراء أي طلبات بعد.</p>
                    </div>`;
            } else {
                ordersContainer.innerHTML = state.orders.map(o => {
                    const statusColor = o.status === 'Processing' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' : 
                                      o.status === 'Pending' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' : 
                                      'text-green-400 bg-green-400/10 border-green-400/20';
                    const statusText = o.status === 'Processing' ? 'قيد التجهيز' : 
                                     o.status === 'Pending' ? 'تم الاستلام' : 'تم الشحن';
                                     
                    const totalHtml = o.method === 'POINTS' 
                        ? `<span class="text-yellow-400 flex items-center justify-end gap-1"><i class="fas fa-star text-[10px]"></i> ${o.total}</span>` 
                        : `<span class="text-ven-accent">${o.total}</span>`;
                                     
                    return `
                    <div class="bg-slate-900/80 border border-slate-700/50 hover:border-ven-primary/50 rounded-xl p-5 transition cursor-pointer group" onclick="navigate('tracking')">
                        <div class="flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <div class="flex items-center gap-3 mb-2">
                                    <span class="font-bold text-white font-mono tracking-wider">${o.id}</span>
                                    <span class="text-[10px] px-2 py-0.5 rounded border ${statusColor} font-bold">${statusText}</span>
                                </div>
                                <div class="text-xs text-slate-400 flex items-center gap-4">
                                    <span><i class="far fa-calendar-alt ml-1"></i> ${o.date}</span>
                                    <span><i class="fas fa-box ml-1"></i> ${o.itemsCount} منتجات</span>
                                </div>
                            </div>
                            <div class="text-left">
                                <div class="font-black text-lg mb-1">${totalHtml}</div>
                                <div class="text-xs text-ven-primary group-hover:text-ven-primaryDark transition font-bold flex items-center justify-end gap-1">
                                    تتبع الطلب <i class="fas fa-arrow-left"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                `}).join('');
            }
        }

        function copyReferral() {
            navigator.clipboard.writeText(state.user.referralCode);
            showToast('تم نسخ كود الإحالة بنجاح!');
        }

        // --- Render Admin ---
        function renderAdmin() {
            document.getElementById('admin-kpi-sales').textContent = fmtMoney(state.admin.totalSales);
            document.getElementById('admin-kpi-orders').textContent = state.admin.ordersCount;
            document.getElementById('admin-kpi-pending').textContent = state.orders.filter(o => o.status !== 'Delivered').length || 12;
            document.getElementById('admin-kpi-customers').textContent = state.admin.customers;
            document.getElementById('admin-kpi-points').textContent = (state.admin.pointsIssued/1000).toFixed(1) + 'K';
            document.getElementById('admin-kpi-points-spent').textContent = (state.admin.pointsSpent/1000).toFixed(1) + 'K';
            
            // Render Chart
            if(salesChartInstance) salesChartInstance.destroy();
            const ctx = document.getElementById('adminSalesChart').getContext('2d');
            
            // Gradient fill
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
            gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

            salesChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['20', '21', '22', '23', '24', '25', 'اليوم'],
                    datasets: [{
                        label: 'الإيرادات (رس)',
                        data: [12500, 15000, 11000, 18500, 16000, 24000, 32000],
                        borderColor: '#8b5cf6',
                        backgroundColor: gradient,
                        borderWidth: 3,
                        pointBackgroundColor: '#0f172a',
                        pointBorderColor: '#8b5cf6',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        tension: 0.4,
                        fill: true,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', titleColor: '#fff', bodyColor: '#fff', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 } },
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b', font: {family: 'Tajawal'} }, position: 'right' },
                        x: { grid: { display: false }, ticks: { color: '#64748b', font: {family: 'Tajawal'} } }
                    },
                    interaction: { intersect: false, mode: 'index' },
                }
            });

            // Render Top Products
            const topContainer = document.getElementById('admin-top-products');
            topContainer.innerHTML = state.admin.topProducts.map((p, index) => {
                const maxSold = state.admin.topProducts[0].sold;
                const width = Math.max(15, (p.sold / maxSold) * 100);
                return `
                <div class="mb-4">
                    <div class="flex justify-between text-sm mb-1.5">
                        <span class="text-white font-medium line-clamp-1">${index+1}. ${p.name}</span>
                        <span class="text-ven-accent font-bold">${p.sold} وحدة</span>
                    </div>
                    <div class="w-full bg-slate-800 rounded-full h-2">
                        <div class="bg-ven-primary h-2 rounded-full" style="width: ${width}%"></div>
                    </div>
                </div>
            `}).join('');

            // Render Table
            const tbody = document.getElementById('admin-orders-table-body');
            tbody.innerHTML = state.admin.recentOrders.map(o => {
                const badgeClass = o.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                   o.status === 'Processing' ? 'bg-blue-500/10 text-blue-400 border-blue-400/20' :
                                   'bg-green-500/10 text-green-400 border-green-400/20';
                
                const methodHtml = o.method === 'POINTS' 
                    ? `<span class="bg-slate-800 px-2 py-1 rounded text-yellow-500 text-[10px] font-bold border border-slate-700 flex items-center justify-center gap-1 w-max"><i class="fas fa-star"></i> نقاط</span>`
                    : `<span class="bg-slate-800 px-2 py-1 rounded text-white text-[10px] font-bold border border-slate-700 flex items-center justify-center gap-1 w-max"><i class="fas fa-credit-card text-slate-400"></i> كاش</span>`;
                    
                return `
                <tr class="hover:bg-slate-800/30 transition">
                    <td class="px-6 py-4 font-mono font-bold text-white whitespace-nowrap">${o.id}</td>
                    <td class="px-6 py-4 text-slate-300 font-medium whitespace-nowrap flex items-center gap-2">
                        <div class="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white">${o.customer[0]}</div>
                        ${o.customer}
                    </td>
                    <td class="px-6 py-4 text-slate-400 whitespace-nowrap">${o.date}</td>
                    <td class="px-6 py-4 text-slate-300 whitespace-nowrap">${o.items} عناصر</td>
                    <td class="px-6 py-4 font-bold text-white whitespace-nowrap">${fmtMoney(o.total)}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${methodHtml}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 text-[10px] font-bold rounded border ${badgeClass}">${o.status}</span>
                    </td>
                </tr>
            `}).join('');
        }

        // ==========================================
        // ROUTER
        // ==========================================
        function navigate(viewId) {
            state.view = viewId;
            
            // Hide all views
            document.querySelectorAll('.view').forEach(el => {
                el.classList.remove('active');
            });
            
            // Show target view
            const target = document.getElementById('view-' + viewId);
            if(target) target.classList.add('active');
            
            // Update mobile nav active states
            document.querySelectorAll('.nav-btn').forEach(el => {
                if(el.dataset.target === viewId) {
                    el.classList.add('text-ven-primary');
                    el.classList.remove('text-slate-400');
                } else {
                    el.classList.remove('text-ven-primary');
                    el.classList.add('text-slate-400');
                }
            });

            // Toggle Main Header visibility based on Admin view
            const header = document.getElementById('main-header');
            if(viewId === 'admin') {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }

            window.scrollTo({top: 0, behavior: 'smooth'});

            // Render view data
            if(viewId === 'home') renderHome();
            if(viewId === 'products') renderProducts();
            if(viewId === 'product-details') renderProductDetails();
            if(viewId === 'cart') renderCart();
            if(viewId === 'checkout') renderCheckout();
            if(viewId === 'account') renderAccount();
            if(viewId === 'admin') renderAdmin();
        }

        // ==========================================
        // INIT
        // ==========================================
        window.onload = () => {
            updateGlobalPoints();
            updateCartBadges();
            navigate('home');
        };

    </script>
</body>
</html>
"""

# Combine parts
final_html = html_content + views_html + views_html2 + views_html3 + views_html4 + js_script

# Write to file
with open('prototype/index.html', 'w', encoding='utf-8') as f:
    f.write(final_html)

print("SUCCESS: prototype/index.html generated.")
'''

print("Python script parts generated.")
