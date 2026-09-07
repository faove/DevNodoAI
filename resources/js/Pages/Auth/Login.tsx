import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });
    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <form onSubmit={submit} className="flex flex-col gap-[18px]">
                {status && (
                    <div className="text-sm font-medium text-emerald-400">
                        {status}
                    </div>
                )}

                <label className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-madison-muted">
                        Email
                    </span>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        autoComplete="username"
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                        className="w-full rounded-[10px] border border-white/10 bg-madison-surface px-3.5 py-3 text-sm text-madison-text outline-none focus:border-madison-blue focus:ring-[3px] focus:ring-madison-blue/20"
                    />
                    <InputError message={errors.email} />
                </label>

                <label className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-madison-muted">
                        Contraseña
                    </span>
                    <span className="relative block">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            autoComplete="current-password"
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="w-full rounded-[10px] border border-madison-blue/55 bg-madison-surface px-3.5 py-3 pr-[74px] text-sm text-madison-text outline-none ring-[3px] ring-madison-blue/15 focus:ring-madison-blue/25"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1.5 text-[11px] font-medium text-madison-blue hover:bg-madison-blue/10"
                        >
                            {showPassword ? 'Ocultar' : 'Mostrar'}
                        </button>
                    </span>
                    <InputError message={errors.password} />
                </label>

                <div className="flex items-center justify-between gap-3">
                    <label className="flex cursor-pointer items-center gap-[9px]">
                        <span className="relative flex h-4 w-4 items-center justify-center">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData('remember', e.target.checked)
                                }
                                className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-[5px] border border-white/20 bg-transparent checked:border-madison-blue checked:bg-madison-blue"
                            />
                            <svg
                                className="pointer-events-none relative hidden h-2.5 w-2.5 peer-checked:block"
                                viewBox="0 0 12 12"
                                fill="none"
                            >
                                <path
                                    d="M2.5 6.2 4.8 8.5 9.5 3.8"
                                    stroke="#04101f"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>
                        <span className="text-[12.5px] text-madison-muted">
                            Recordarme
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-[12.5px] font-medium text-madison-blue hover:text-[#8fbcff]"
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-1 w-full rounded-[11px] bg-gradient-to-r from-[#3b82f6] via-madison-blue to-madison-violet py-3.5 text-[14.5px] font-semibold text-[#04101f] shadow-[0_12px_30px_rgba(59,130,246,.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Iniciar sesión
                </button>

                <div className="mt-0.5 flex items-center gap-3">
                    <span className="h-px flex-1 bg-white/10" />
                    <span className="font-display text-[10px] font-medium uppercase tracking-[.14em] text-madison-dim">
                        espacio reservado
                    </span>
                    <span className="h-px flex-1 bg-white/10" />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-[10px] border border-dashed border-white/[.14] py-[11px] text-center text-xs font-medium text-madison-dim">
                        Google
                    </div>
                    <div className="rounded-[10px] border border-dashed border-white/[.14] py-[11px] text-center text-xs font-medium text-madison-dim">
                        Microsoft · SSO
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
