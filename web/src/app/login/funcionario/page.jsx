'use client';

// -----------------------------------------------------------------------------
// IMPORTAÇÕES
// -----------------------------------------------------------------------------

import { useState, useLayoutEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext'; 
import { z } from 'zod';
import api from '../../../lib/api';
import Image from 'next/image';

// -----------------------------------------------------------------------------
// SCHEMAS DE VALIDAÇÃO (ZOD) - Sem alterações
// -----------------------------------------------------------------------------

const loginSchema = z.object({
    email: z.string().nonempty("O email é obrigatório").email({ message: "Insira um email válido" }),
    senha: z.string().nonempty("A senha é obrigatória"),
});
const cadastroSchema = z.object({
    nome: z.string().min(2, "O nome é muito curto"),
    sobrenome: z.string().min(2, "O sobrenome é muito curto"),
    telefone: z.string().optional().or(z.literal('')),
    email: z.string().nonempty("O email é obrigatório").email("Insira um email válido"),
    senha: z.string().min(8, "A senha precisa ter no mínimo 8 caracteres"),
});
const forgotPasswordSchema = z.object({
    email: z.string().nonempty("O email é obrigatório").email({ message: "Insira um email válido" }),
});

// -----------------------------------------------------------------------------
// COMPONENTE PRINCIPAL DA PÁGINA
// -----------------------------------------------------------------------------

export default function AuthPage() {
    const backgroundSource = "/teste.png";
    return (
        <>
            <main className="min-h-screen flex items-center justify-center bg-[#F7F4F0] p-4 font-sans overflow-hidden">
                <DynamicBackground src={backgroundSource} />
                <AuthViewManager />
            </main>
            <GlobalStyles />
        </>
    );
}

// -----------------------------------------------------------------------------
// GERENCIADOR DE VISUALIZAÇÃO E ANIMAÇÃO
// -----------------------------------------------------------------------------

const AuthViewManager = () => {
    const [view, setView] = useState('login');
    const [isAnimating, setIsAnimating] = useState(false);
    const [containerHeight, setContainerHeight] = useState('auto');

    useLayoutEffect(() => {
        const heights = {
            login: '720px',
            register: '900px',
            forgotPassword: '480px',
        };
        setContainerHeight(heights[view] || 'auto');
    }, [view]);

    const changeView = (newView) => {
        if (isAnimating) return;
        setIsAnimating(true);
        setTimeout(() => setView(newView), 700);
        setTimeout(() => setIsAnimating(false), 1300);
    };
    const maxHeightClasses = {
        login: 'max-h-[90vh] sm:max-h-[720px]',
        register: 'max-h-[95vh] sm:max-h-[870px]',
        forgotPassword: 'max-h-[90vh] sm:max-h-[620px]',
    };

    return (
        <div
            className="relative w-full max-w-lg bg-white/60 backdrop-blur-lg border border-white/30 rounded-3xl shadow-2xl overflow-hidden transition-[height] duration-500 ease-in-out"
            style={{ height: containerHeight }}
        >
            <div className={`absolute inset-0 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100 delay-[800ms]'}`}>
                {view === 'login' && <LoginForm onRegisterClick={() => changeView('register')} onForgotPasswordClick={() => changeView('forgotPassword')} />}
                {view === 'register' && <RegisterForm onLoginClick={() => changeView('login')} />}
                {view === 'forgotPassword' && <ForgotPasswordForm onBackToLoginClick={() => changeView('login')} />}
            </div>


            <div className={`absolute inset-0 z-20 bg-[#FFFBEB] transition-transform duration-700 ease-[cubic-bezier(0.8,0,0.2,1)] ${isAnimating ? 'translate-y-0' : 'translate-y-full'}`} style={{ transitionDelay: isAnimating ? '0s' : '600ms' }}></div>
            <div className={`absolute inset-0 z-30 bg-[#FFD600] transition-transform duration-700 ease-[cubic-bezier(0.8,0,0.2,1)] ${isAnimating ? 'translate-y-0' : 'translate-y-full'}`} style={{ transitionDelay: isAnimating ? '100ms' : '400ms' }}></div>
            <div className={`absolute inset-0 z-40 bg-[#404040] transition-transform duration-700 ease-[cubic-bezier(0.8,0,0.2,1)] ${isAnimating ? 'translate-y-0' : 'translate-y-full'}`} style={{ transitionDelay: isAnimating ? '200ms' : '200ms' }}>
                <div className="absolute left-0 top-0 h-full w-10 bg-gray-400"></div>
                <div className="absolute right-0 top-0 h-full w-10 bg-gray-400"></div>
                <div className="absolute inset-x-1/2 -translate-x-1/2 w-1.5 h-full top-0 opacity-40 overflow-hidden">
                    <div className="absolute w-full h-[200%]" style={{ background: 'repeating-linear-gradient(transparent, transparent 15px, #666 15px, #666 35px)', animation: isAnimating ? 'driveAnim 1.2s linear infinite' : 'none' }}></div>
                </div>

                <div className={`absolute top-full left-1/2 -translate-x-1/2 transition-transform duration-1000 ease-out ${isAnimating ? '-translate-y-[450px] delay-300' : 'translate-y-24'}`}>
                    <CarIcon className="w-200 h-80" />
                </div>
            </div>
        </div>
    );
};

// -----------------------------------------------------------------------------
// FORMULÁRIOS LOGIN
// -----------------------------------------------------------------------------

const LoginForm = ({ onRegisterClick, onForgotPasswordClick }) => {

    const router = useRouter();
      const { login } = useAuth();
    const { register, handleSubmit, formState: { errors }, setError, clearErrors } = useForm({
        resolver: zodResolver(loginSchema), mode: 'onBlur',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [facebookLoading, setFacebookLoading] = useState(false);
    const [lembrarDeMim, setLembrarDeMim] = useState(true);
    const [apiSuccess, setApiSuccess] = useState('');


const onSubmit = async (data) => {
    setIsSubmitting(true);
    clearErrors("apiError");
    setApiSuccess('');

    try {
        const response = await api.post('/auth/login', data);

        if (response.data && response.data.token && response.data.usuario) {
            const { token, usuario } = response.data;
            
            const userDataToStore = {
                nome: usuario.nome,
                email: usuario.email,
                papel: usuario.papel
            };

            // Chama a função 'login' do seu AuthContext
            login(userDataToStore, token, lembrarDeMim);

            // Define a mensagem de sucesso para ser exibida no formulário
            setApiSuccess("Login bem-sucedido! Redirecionando ...");

            setTimeout(() => {
                router.push('/funcionario/dashboard');
            }, 500);

        } else {
            // Se a API retornar sucesso (200 OK) mas sem os dados esperados
            setError("apiError", { type: 'custom', message: "Resposta inesperada do servidor." });
        }

    } catch (error) {
        // Verifica se o erro veio da API (ex: 401 Unauthorized, 404 Not Found, etc.)
        if (error.response && error.response.data && error.response.data.message) {
            // Pega a mensagem de erro que o backend enviou (ex: "Email ou senha inválidos.")
            // e a define para ser exibida no formulário.
            setError("apiError", { type: 'custom', message: error.response.data.message });
        } else {
            // Se for um erro de rede (backend offline), exibe a mensagem de conexão.
            setError("apiError", { type: 'custom', message: 'Não foi possível conectar ao servidor.' });
        }
    } finally {
        setIsSubmitting(false);
    }
};

    return (
        <div className="p-6 sm:p-10 w-full flex flex-col">

            <div className="text-center mb-8">
                <Image src="/light.png" alt="Logo" width={56} height={56} className="mx-auto" />
                <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">Bem-vindo de Volta</h1>
                <p className="mt-1 text-sm text-gray-500">Acesse seu painel</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <SoftInput id="email" type="email" label="Endereço de Email" register={register('email')} error={errors.email} />
                <SoftInput id="senha" type='password' label="Senha" register={register('senha')} error={errors.senha} hasIcon={true} />

                <div className="flex items-center justify-between pt-1 text-sm">
                    <label className="flex items-center gap-2 text-yellow-600 cursor-pointer custom-checkbox">
                        <input type="checkbox" className="absolute opacity-0 w-0 h-0" checked={lembrarDeMim} onChange={(e) => setLembrarDeMim(e.target.checked)} />
                        <span className="checkbox-visual"><CheckIcon className="check-icon" /></span>
                        <span>Lembrar de mim</span>
                    </label>
                    <button type="button" onClick={onForgotPasswordClick} className="font-semibold text-yellow-600 underline-grow">Esqueci a senha</button>
                </div>

                <div>
                    {apiSuccess && <p className='text-green-600 font-semibold'>{apiSuccess}</p>}
                    {errors.apiError && <p className='text-red-500'>{errors.apiError.message}</p>}
                </div>

                <div className="pt-2">
                    <button type="submit" disabled={isSubmitting} className="main-button">{isSubmitting ? 'Aguarde...' : 'Entrar'}</button>
                </div>
            </form>

            <div className="my-6 flex items-center gap-4">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="text-xs text-gray-400 font-medium">ou</span>
                <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <button type="button" onClick={() => { setGoogleLoading(true); setTimeout(() => setGoogleLoading(false), 1500); }} className="social-button">{googleLoading ? <span className="loader"></span> : <GoogleIcon className="w-5 h-5" />} Google</button>
                <button type="button" onClick={() => { setFacebookLoading(true); setTimeout(() => setFacebookLoading(false), 1500); }} className="social-button">{facebookLoading ? <span className="loader"></span> : <FacebookIcon className="w-5 h-5" />} Facebook</button>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
                Ainda não tem uma conta na plataforma?
                <button onClick={onRegisterClick} className="font-semibold text-yellow-600 underline-grow ml-1">Cadastre-se</button>
            </div>
        </div>
    );
};
// -----------------------------------------------------------------------------
// FORMULÁRIOS REGISTRO
// -----------------------------------------------------------------------------

const RegisterForm = ({ onLoginClick, role = "FUNCIONARIO" }) => {

    const { register, handleSubmit, formState: { errors }, setError, clearErrors } = useForm({
        resolver: zodResolver(cadastroSchema), mode: 'onBlur',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false); 
    const [facebookLoading, setFacebookLoading] = useState(false); 
    const [apiSuccess, setApiSuccess] = useState('');

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        clearErrors("apiError");
        setApiSuccess('');
        
        let apiData = { ...data };
        apiData.nome = `${data.nome} ${data.sobrenome}`.trim();
        delete apiData.sobrenome;
        
        apiData.papel = role;
        
        try {
        
            await api.post('/usuarios/cadastro', apiData);
                        
            setApiSuccess("Cadastro realizado! Você será redirecionado para o login.");
            setTimeout(() => onLoginClick(), 2500); 

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erro ao realizar o cadastro.';
            setError("apiError", { type: 'custom', message: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };
    return (

        <div className="p-4 sm:p-10 w-full flex flex-col h-full">
            <div className="text-center mb-6 sm:mb-8">
                <Image src="/light.png" alt="Logo" width={56} height={56} className="mx-auto" />

                <h1 className="mt-2 sm:mt-4 text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">Crie Sua Conta</h1>
                <p className="mt-1 text-sm text-gray-500">Rápido e sem complicações</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                    <SoftInput id="nome" label="Nome" register={register('nome')} error={errors.nome} />
                    <SoftInput id="sobrenome" label="Sobrenome" register={register('sobrenome')} error={errors.sobrenome} />
                </div>

                <SoftInput id="telefone" label="Telefone (Opcional)" type="tel" register={register('telefone')} error={errors.telefone} />
                <SoftInput id="email" type="email" label="Endereço de Email" register={register('email')} error={errors.email} />
                <SoftInput id="senha" type="password" label="Senha" register={register('senha')} error={errors.senha} hasIcon={true} />

                <div >
                    {apiSuccess && <p className='text-green-600 font-semibold'>{apiSuccess}</p>}
                    {errors.apiError && <p className='text-red-500'>{errors.apiError.message}</p>}
                </div>

                <div className="pt-2">
                    <button type="submit" disabled={isSubmitting} className="main-button">{isSubmitting ? 'Cadastrando...' : 'Criar Conta'}</button>
                </div>
            </form>

            <div className="my-4 sm:my-6 flex items-center gap-4"><div className="h-px bg-gray-200 flex-1"></div><span className="text-xs text-gray-400 font-medium">ou</span><div className="h-px bg-gray-200 flex-1"></div></div>
            <div className="flex flex-col sm:flex-row gap-4">
                <button type="button" onClick={() => { setGoogleLoading(true); setTimeout(() => setGoogleLoading(false), 2000); }} className="social-button">{googleLoading ? <span className="loader"></span> : <GoogleIcon className="w-5 h-5" />} Google</button>
                <button type="button" onClick={() => { setFacebookLoading(true); setTimeout(() => setFacebookLoading(false), 2000); }} className="social-button">{facebookLoading ? <span className="loader"></span> : <FacebookIcon className="w-5 h-5" />} Facebook</button>
            </div>

            <div className=" sm:mt-8 text-center text-sm text-gray-500 p-8">
                Você já é um membro?
                <button onClick={onLoginClick} className="font-semibold text-yellow-600 underline-grow ml-1">Faça login</button>
            </div>
        </div>
    );
};

// -----------------------------------------------------------------------------
// FORMULÁRIOS ESQUECI A SENHA
// -----------------------------------------------------------------------------

const ForgotPasswordForm = ({ onBackToLoginClick }) => {

    const { register, handleSubmit, formState: { errors }, setError, clearErrors } = useForm({
        resolver: zodResolver(forgotPasswordSchema), mode: 'onBlur',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiSuccess, setApiSuccess] = useState('');

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        clearErrors("apiError");
        setApiSuccess('');

        try {
            const response = await api.post('/auth/esqueceu-senha', data);
            setApiSuccess(response.data.message);
            setTimeout(() => onBackToLoginClick(), 5000);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erro ao processar sua solicitação.';
            setError("apiError", { type: 'custom', message: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="p-6 sm:p-10 w-full flex flex-col">
            <div className="text-center mb-8">
                <Image src="/light.png" alt="Logo" width={56} height={56} className="mx-auto" />
                <h1 className="mt-4 text-2xl font-bold text-gray-800 tracking-tight">Esqueceu sua senha?</h1>
                <p className="mt-1 text-sm text-gray-500">Insira seu email e enviaremos um link para você criar uma nova senha.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <SoftInput id="email" type="email" label="Seu endereço de Email" register={register('email')} error={errors.email} />

                <div >
                    {apiSuccess && <p className='text-green-600 font-semibold'>{apiSuccess}</p>}
                    {errors.apiError && <p className='text-red-500'>{errors.apiError.message}</p>}
                </div>

                <div className="pt-2">
                    <button type="submit" disabled={isSubmitting || !!apiSuccess} className="main-button">{isSubmitting ? 'Enviando...' : 'Enviar Link de Recuperação'}</button>
                </div>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500">
                Lembrou da senha?
                <button onClick={onBackToLoginClick} className="font-semibold text-yellow-600 underline-grow ml-1">Faça login</button>
            </div>
        </div>
    );
};


// -----------------------------------------------------------------------------
// COMPONENTES DE UI E ESTILOS
// -----------------------------------------------------------------------------

function SoftInput({ id, label, type = 'text', register, error, hasIcon = false }) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const togglePasswordVisibility = () => setIsPasswordVisible(prev => !prev);

    const finalType = hasIcon ? (isPasswordVisible ? 'text' : 'password') : type;

    return (
        <div className="relative pb-4">
            <div className={`soft-input-wrapper ${error ? 'error' : ''}`}>
                <input id={id} type={finalType} placeholder=" " {...register} className="soft-input" />
                <label htmlFor={id} className="soft-label">{label}</label>
                <div className="accent-bar"></div>
                {hasIcon && <button type="button" onClick={togglePasswordVisibility} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-gray-400 hover:text-yellow-600">{isPasswordVisible ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}</button>}
            </div>
            {error && <span className="error-message">{error.message}</span>}
        </div>
    );
}

function DynamicBackground({ src }) {
    const isVideo = /\.(mp4|webm)$/i.test(src);
    return isVideo
        ? <video className="absolute inset-0 w-full h-full object-cover -z-10" autoPlay loop muted><source src={src} type={`video/${src.split('.').pop()}`} /></video>
        : <Image src={src} alt="background" fill className="absolute inset-0 object-cover -z-10 opacity-40" />;
}
function GlobalStyles() {
    return (
        <style jsx global>{`
            :root {
                --c-yellow: #FFD600; 
                --c-yellow-dark: #f9a825; 
                --c-text-on-yellow: #4E431B;
                --c-input-bg: #FCFBF8; 
                --c-input-border: #F3EAE0; 
                --c-input-text: #6e5847;
                --c-label-text: #b8aaa0; 
                --c-error: #ef4444;
            }

            .main-button { 
                width: 100%; 
                padding: 14px; 
                font-weight: 600; 
                color: var(--c-text-on-yellow); 
                background: var(--c-yellow); 
                border-radius: 14px; 
                transition: all 0.25s ease-out; /* Transição mais rápida e suave */
            }

            .main-button:hover:not(:disabled) {
                background-color: #ffde33; /* Amarelo um pouco mais claro no hover */
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(249, 168, 37, 0.2);
            }

            .main-button:disabled { 
                background-color: #f9a82580; 
                cursor: not-allowed; 
            }
            
            .social-button { 
                flex: 1; 
                display: inline-flex; 
                justify-content: center; 
                align-items: center; 
                gap: 8px; 
                padding: 12px; 
                font-weight: 500; 
                color: #374151; 
                background: #fff; 
                border: 1px solid #dcdfe2; 
                border-radius: 12px; 
                transition: all 0.2s; 
            }
            .social-button:hover {
                border-color: #ccc;
                background-color: #f9fafb;
            }
            
            .soft-input-wrapper { 
                position: relative; 
                overflow: hidden; 
                border-radius: 14px; 
            }
            
            .soft-input { 
                width: 100%; 
                font-size: 1rem; 
                color: var(--c-input-text); 
                background: var(--c-input-bg); 
                border: 1px solid var(--c-input-border); 
                border-radius: 14px; 
                padding: 26px 18px 10px 18px; 
                outline: none; 
                transition: all 0.2s ease-out; 
                position: relative; 
                z-index: 1; 
            }
            
            .soft-input[type="password"]::-ms-reveal { 
                display: none; 
            }
            
            .soft-label { 
                position: absolute; 
                top: 18px; 
                left: 19px; 
                color: var(--c-label-text); 
                pointer-events: none; 
                transition: all 0.2s ease-out; 
                z-index: 2; 
            }
            
            .soft-input:focus + .soft-label, 
            .soft-input:not(:placeholder-shown) + .soft-label { 
                top: 8px; 
                font-size: 0.75rem; 
                color: var(--c-text-on-yellow); 
                font-weight: 500; 
            }
            
            .accent-bar { 
                position: absolute; 
                bottom: 0; 
                left: 0; 
                right: 0; 
                height: 2px; 
                background: var(--c-yellow-dark); 
                transform: scaleX(0); 
                transition: transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1); 
                transform-origin: left; 
                z-index: 3; 
            }
            
            .soft-input-wrapper:focus-within .accent-bar { 
                transform: scaleX(1); 
            }
            
            .soft-input-wrapper.error .soft-input { 
                border-color: var(--c-error); 
                animation: shake 0.5s ease-out; 
            }
            
            .error-message { 
                position: absolute; 
                bottom: -5px; 
                left: 2px; 
                color: var(--c-error); 
                font-size: 0.8rem; 
            }
            
            .loader { 
                width: 18px; 
                height: 18px; 
                border-radius: 50%; 
                border: 3px solid rgba(249, 168, 37, 0.2); 
                border-top-color: var(--c-yellow-dark); 
                animation: spin 1s linear infinite; 
            }
            
            .underline-grow { 
                position: relative; 
                text-decoration: none; 
                padding-bottom: 2px;
            }
            
            .underline-grow::after { 
                content: ''; 
                position: absolute; 
                width: 0; 
                height: 1px; 
                bottom: 0; 
                left: 0; 
                background-color: var(--c-yellow-dark); 
                transition: width 0.3s ease-in-out; 
            }
            
            .underline-grow:hover::after { 
                width: 100%; 
            }
            
            .custom-checkbox .checkbox-visual { 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                width: 1rem; 
                height: 1rem; 
                border: 1px solid #9ca3af; 
                border-radius: 0.25rem; 
                transition: background-color 0.2s, border-color 0.2s; 
            }
            
            .custom-checkbox .check-icon { 
                width: 0.75rem; 
                height: 0.75rem; 
                color: var(--c-text-on-yellow); 
                opacity: 0; 
                transform: scale(0.5); 
                transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out; 
            }
            
            .custom-checkbox input:checked + .checkbox-visual { 
                background-color: var(--c-yellow); 
                border-color: var(--c-yellow-dark); 
            }
            
            .custom-checkbox input:checked + .checkbox-visual .check-icon { 
                opacity: 1; 
                transform: scale(1); 
            }

            @keyframes shake { 
                10%,90%{transform:translateX(-1px)}
                20%,80%{transform:translateX(2px)}
                30%,50%,70%{transform:translateX(-2px)}
                40%,60%{transform:translateX(2px)} 
            }
            
            @keyframes spin { 
                to { transform: rotate(360deg); } 
            }

            @keyframes driveAnim { 
                from { transform: translateY(-50%); } 
                to { transform: translateY(0); } 
            }
        `}</style>
    );
}

function CheckIcon(props) { return (<svg fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>); }
function CarIcon(props) { return (<svg viewBox="0 0 120 260" xmlns="http://www.w3.org/2000/svg" {...props}> <defs> <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.5" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs><path d="M 50,10 C 30,10 20,25 20,50 L 20,210 C 20,235 30,250 50,250 L 70,250 C 90,250 100,235 100,210 L 100,50 C 100,25 90,10 70,10 L 50,10 Z" fill="#FFD600" /><path d="M 85,70 L 35,70 L 30,100 L 30,190 L 35,220 L 85,220 L 90,190 L 90,100 L 85,70 Z" fill="#111" fillOpacity="0.8" /><path d="M 25,40 L 95,40 L 90,55 L 30,55 Z" fill="#fff" filter="url(#glow)" /><path d="M 25,220 L 95,220 L 90,205 L 30,205 Z" fill="#EF4444" filter="url(#glow)" /></svg>); }
function EyeIcon(props) { return (<svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>); }
function EyeSlashIcon(props) { return (<svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L6.228 6.228" /></svg>); }
function GoogleIcon(props) { return (<svg viewBox="0 0 24 24" {...props}><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>) }
function FacebookIcon(props) { return (<svg className="w-6 h-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" {...props}><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"></path></svg>) }

