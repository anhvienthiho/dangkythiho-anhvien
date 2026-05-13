import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { getAuth, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { User, Facebook, Phone, CreditCard, Mail, School, GraduationCap, Send, CheckCircle2, Sparkles, AlertCircle, Sun, Moon, ShieldCheck } from 'lucide-react';

// Kết nối CHUNG Firebase với hệ thống CRM
const firebaseConfig = {
  apiKey: "AIzaSyA8xTnRXu-GMDEorSTV1g7P00Nb9OYYpVI",
  authDomain: "yourrecorder-65a94.firebaseapp.com",
  projectId: "yourrecorder-65a94",
  storageBucket: "yourrecorder-65a94.firebasestorage.app",
  messagingSenderId: "1070289116371",
  appId: "1:1070289116371:web:f16c5a985e24a7c1fd4826",
  measurementId: "G-LTDRM1T0NX"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const appId = "yourrecorder-65a94";

// Component InputField được đưa ra ngoài để tránh lỗi mất focus khi state thay đổi
const InputField = ({ label, icon: Icon, value, onChange, placeholder, required = true, type = "text", subLabel = "", themeStyles }) => (
    <div className="space-y-2">
        <label className={`text-[11px] font-bold uppercase tracking-widest ml-1 ${themeStyles.label}`}>
            {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Icon size={18} /></div>
            <input 
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full border rounded-2xl py-4 pl-12 pr-6 text-sm font-semibold outline-none transition-all ${themeStyles.input}`}
                required={required}
            />
        </div>
        {subLabel && <p className="text-[10px] text-slate-400 ml-1 italic">{subLabel}</p>}
    </div>
);

export default function App() {
    const [user, setUser] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [formData, setFormData] = useState({ 
        fbName: '', 
        fbLink: '', 
        fullName: '',
        phone: '',
        cccd: '',
        email: '',
        mssv: '',
        class: '',
        batch: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const initAuth = async () => {
            try {
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    await signInAnonymously(auth);
                }
                setUser(auth.currentUser);
            } catch (err) {
                console.error("Auth error:", err);
            }
        };
        initAuth();
    }, []);

    const toggleTheme = (e) => {
        e.preventDefault();
        setIsDarkMode(prev => !prev);
    };

    const handlePhoneChange = (val) => {
        const cleaned = val.replace(/\D/g, '').slice(0, 10);
        setFormData(prev => ({...prev, phone: cleaned}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setError('Đang kết nối hệ thống, vui lòng thử lại sau giây lát.');
            return;
        }

        if (formData.phone.length !== 10) {
            setError('Số điện thoại phải bao gồm đúng 10 chữ số.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const customersRef = collection(db, 'artifacts', appId, 'public', 'data', 'customers');
            const snapshot = await getDocs(customersRef);
            const currentCustomers = snapshot.docs.map(d => d.data());
            const nextStt = currentCustomers.length > 0 
                ? Math.max(...currentCustomers.map(c => c.stt || 0)) + 1 
                : 1;

            const newCustomerId = `c_${Date.now()}`;
            
            const detailedInfo = `
Họ tên: ${formData.fullName}
SĐT: ${formData.phone}
CCCD: ${formData.cccd || '0'}
Email: ${formData.email}
MSSV: ${formData.mssv}
Lớp: ${formData.class}
Khóa: ${formData.batch}
(Đăng ký qua Web - Cam kết bảo mật)`.trim();

            await setDoc(doc(customersRef, newCustomerId), {
                stt: nextStt,
                name: formData.fbName.trim(),
                fbLink: formData.fbLink.trim(),
                rawText: detailedInfo,
                assignedExams: [],
                createdAt: Date.now(),
                isUrging: false
            });

            setSuccess(true);
            setFormData({ 
                fbName: '', fbLink: '', fullName: '', phone: '', 
                cccd: '', email: '', mssv: '', class: '', batch: '' 
            });
        } catch (err) {
            console.error(err);
            setError('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const themeStyles = {
        page: isDarkMode ? "bg-[#050508] text-slate-200" : "bg-slate-50 text-slate-800",
        card: isDarkMode ? "bg-[#0a0a0f]/80 border-white/10 shadow-2xl" : "bg-white border-slate-200 shadow-xl",
        input: isDarkMode ? "bg-black/40 border-white/10 text-white focus:border-purple-500/50" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500/50",
        label: isDarkMode ? "text-slate-400" : "text-slate-500",
        glow: isDarkMode ? "bg-purple-600/20" : "bg-purple-400/10",
        infoBox: isDarkMode ? "bg-purple-500/5 border-purple-500/20" : "bg-purple-50 border-purple-100"
    };

    // Style chung để import font
    const fontStyle = (
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
            * { font-family: 'Inter', sans-serif !important; }
        `}</style>
    );

    if (success) {
        return (
            <div className={`min-h-screen flex items-center justify-center p-6 transition-all duration-300 ${themeStyles.page}`}>
                {fontStyle}
                <div className={`max-w-md w-full border rounded-[2.5rem] p-10 text-center ${themeStyles.card}`}>
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} className="text-emerald-500" />
                    </div>
                    <h2 className={`text-2xl font-black italic uppercase tracking-tighter mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Gửi thành công!</h2>
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
                        Thông tin của bạn đã được chuyển đến hệ thống bảo mật. Chúng mình sẽ liên hệ sớm nhất nhé!
                    </p>
                    <button 
                        onClick={() => setSuccess(false)} 
                        className={`w-full py-4 rounded-2xl font-bold text-sm uppercase transition-all border ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'}`}
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 sm:p-8 transition-all duration-300 ${themeStyles.page}`}>
            {fontStyle}

            <div className={`max-w-2xl w-full border rounded-[2.5rem] overflow-hidden relative transition-all duration-300 ${themeStyles.card}`}>
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 blur-[100px] pointer-events-none ${themeStyles.glow}`}></div>

                <button type="button" onClick={toggleTheme} className={`absolute top-6 right-6 p-3 rounded-full border transition-all z-20 ${isDarkMode ? 'bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="p-8 sm:p-12 relative z-10">
                    <div className="text-center mb-10">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest mb-6 ${isDarkMode ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-700'}`}>
                            <Sparkles size={12} /> Hỗ trợ đăng ký trực tuyến
                        </div>
                        <h1 className={`text-3xl sm:text-4xl font-black italic uppercase tracking-tighter mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            Đăng Ký <span className="text-purple-600">Thông Tin</span>
                        </h1>
                        <p className="text-slate-500 text-sm italic font-medium">Hệ thống bảo mật thông tin thí sinh 100%.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-rose-500 text-sm">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Tên Facebook" icon={User} value={formData.fbName} onChange={(val) => setFormData(prev => ({...prev, fbName: val}))} placeholder="Tên hiển thị trên Facebook" themeStyles={themeStyles} />
                            <InputField label="Link Facebook" icon={Facebook} value={formData.fbLink} onChange={(val) => setFormData(prev => ({...prev, fbLink: val}))} placeholder="https://facebook.com/..." themeStyles={themeStyles} />
                        </div>

                        <div className="h-px bg-slate-200/50 dark:bg-white/5 my-4"></div>
                        
                        <div className={`p-5 rounded-2xl border mb-6 ${themeStyles.infoBox}`}>
                            <div className="flex gap-3">
                                <ShieldCheck className="text-purple-600 shrink-0" size={20} />
                                <div className="space-y-1">
                                    <p className={`text-[11px] font-black uppercase tracking-wider ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>Cam kết bảo mật thông tin</p>
                                    <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                                        Đây là thông tin web thi yêu cầu, đảm bảo 100% bảo mật thông tin khách hàng. Bên thứ 3 duy nhất biết thông tin này là BTC các kỳ thi.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Họ tên" icon={User} value={formData.fullName} onChange={(val) => setFormData(prev => ({...prev, fullName: val}))} placeholder="Họ và tên thật" themeStyles={themeStyles} />
                            
                            <div className="space-y-2">
                                <label className={`text-[11px] font-bold uppercase tracking-widest ml-1 ${themeStyles.label}`}>
                                    SĐT <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Phone size={18} /></div>
                                    <input 
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => handlePhoneChange(e.target.value)}
                                        placeholder="Ví dụ: 0912345678"
                                        className={`w-full border rounded-2xl py-4 pl-12 pr-6 text-sm font-semibold outline-none transition-all ${themeStyles.input}`}
                                        required
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 ml-1 italic font-medium">Nhập đúng 10 số, không khoảng cách</p>
                            </div>

                            <InputField label="CCCD" icon={CreditCard} value={formData.cccd} onChange={(val) => setFormData(prev => ({...prev, cccd: val}))} placeholder="Số CCCD" required={false} subLabel="Nếu có" themeStyles={themeStyles} />
                            <InputField label="Email" icon={Mail} value={formData.email} onChange={(val) => setFormData(prev => ({...prev, email: val}))} placeholder="Địa chỉ email" type="email" themeStyles={themeStyles} />
                            <InputField label="MSSV" icon={School} value={formData.mssv} onChange={(val) => setFormData(prev => ({...prev, mssv: val}))} placeholder="Mã số sinh viên" themeStyles={themeStyles} />
                            <InputField label="Lớp" icon={GraduationCap} value={formData.class} onChange={(val) => setFormData(prev => ({...prev, class: val}))} placeholder="Tên lớp (ví dụ: K44A1)" themeStyles={themeStyles} />
                            <InputField label="Khóa" icon={GraduationCap} value={formData.batch} onChange={(val) => setFormData(prev => ({...prev, batch: val}))} placeholder="Khóa học (ví dụ: 44)" themeStyles={themeStyles} />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full py-4 mt-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-xl
                                ${loading 
                                    ? 'bg-purple-600/50 text-white/50 cursor-not-allowed' 
                                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20 hover:shadow-purple-700/40'
                                }
                            `}
                        >
                            {loading ? <span className="animate-pulse">Đang xử lý...</span> : <><Send size={18} /> Gửi Đăng Ký</>}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                            Hệ thống bảo mật bởi UEH CRM
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}