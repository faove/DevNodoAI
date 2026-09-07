import ApplicationLogo from '@/Components/ApplicationLogo';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({
    auth,
    canLogin,
    canRegister,
}: PageProps<{ canLogin: boolean; canRegister: boolean }>) {
    return (
        <>
            <Head title="Madison AI">
                <style>{`
                    @keyframes mdFlow { to { stroke-dashoffset: -240; } }
                    @keyframes mdPulse { 0%, 100% { opacity: .25; r: 3; } 50% { opacity: 1; } }
                `}</style>
            </Head>

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-madison-surface to-madison-card font-jakarta text-madison-text">
                <svg
                    viewBox="0 0 1120 720"
                    preserveAspectRatio="xMidYMid slice"
                    className="pointer-events-none absolute inset-0 h-full w-full opacity-[.85]"
                    fill="none"
                >
                    <g
                        stroke="rgba(91,156,255,.28)"
                        strokeWidth="1.2"
                        strokeDasharray="4 8"
                        style={{ animation: 'mdFlow 9s linear infinite' }}
                    >
                        <path d="M820 150 L940 300 L820 470 L660 400 L820 150" />
                        <path d="M940 300 L1060 200 M660 400 L560 250 M820 470 L900 620 M660 400 L720 600" />
                    </g>
                    <g fill="#5b9cff">
                        <circle
                            cx="820"
                            cy="150"
                            r="4"
                            style={{
                                animation: 'mdPulse 4s ease-in-out infinite',
                            }}
                        />
                        <circle
                            cx="940"
                            cy="300"
                            r="4"
                            style={{
                                animation:
                                    'mdPulse 4s ease-in-out .6s infinite',
                            }}
                        />
                        <circle
                            cx="820"
                            cy="470"
                            r="4"
                            style={{
                                animation:
                                    'mdPulse 4s ease-in-out 1.2s infinite',
                            }}
                        />
                        <circle
                            cx="1060"
                            cy="200"
                            r="3"
                            style={{
                                animation:
                                    'mdPulse 4s ease-in-out 1.8s infinite',
                            }}
                        />
                        <circle
                            cx="560"
                            cy="250"
                            r="3"
                            style={{
                                animation:
                                    'mdPulse 4s ease-in-out 2.4s infinite',
                            }}
                        />
                        <circle
                            cx="900"
                            cy="620"
                            r="3"
                            style={{
                                animation: 'mdPulse 4s ease-in-out 3s infinite',
                            }}
                        />
                        <circle
                            cx="720"
                            cy="600"
                            r="3"
                            style={{
                                animation:
                                    'mdPulse 4s ease-in-out 3.6s infinite',
                            }}
                        />
                    </g>
                    <circle cx="660" cy="400" r="8" fill="#8b7bff" />
                    <circle
                        cx="660"
                        cy="400"
                        r="20"
                        stroke="rgba(139,123,255,.35)"
                        strokeWidth="1.2"
                    />
                </svg>
                <div className="pointer-events-none absolute left-[-160px] top-[120px] h-[480px] w-[640px] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,.22),transparent_65%)]" />

                <div className="relative flex min-h-screen flex-col">
                    <header className="flex items-center justify-between px-8 py-7 sm:px-16">
                        <div className="flex items-center gap-2.5">
                            <ApplicationLogo className="h-8 w-8" />
                            <span className="font-display text-lg font-bold">
                                madison
                                <span className="text-madison-blue">.ai</span>
                            </span>
                        </div>

                        <nav className="flex items-center gap-6 text-sm font-medium text-madison-muted">
                            {auth.user ? (
                                <Link
                                    href={route('chat.index')}
                                    className="rounded-full bg-madison-blue px-5 py-2.5 font-semibold text-[#04101f] transition hover:bg-[#8fbcff]"
                                >
                                    Ir al chat
                                </Link>
                            ) : (
                                <>
                                    {canLogin && (
                                        <Link
                                            href={route('login')}
                                            className="transition hover:text-madison-text"
                                        >
                                            Iniciar sesión
                                        </Link>
                                    )}
                                    {canRegister && (
                                        <Link
                                            href={route('register')}
                                            className="rounded-full bg-madison-blue px-5 py-2.5 font-semibold text-[#04101f] transition hover:bg-[#8fbcff]"
                                        >
                                            Crear cuenta
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </header>

                    <main className="flex flex-1 items-center px-8 sm:px-16">
                        <div className="flex w-full max-w-xl flex-col gap-8 py-16">
                            <div className="flex flex-col gap-4">
                                <div className="font-display text-[10px] font-semibold uppercase tracking-[.18em] text-madison-blue">
                                    Plataforma de agentes
                                </div>
                                <h1 className="text-wrap-pretty font-display text-4xl font-bold leading-[1.08] tracking-tight text-madison-text sm:text-[42px]">
                                    Inteligencia conectada a tu operación.
                                </h1>
                                <p className="max-w-md text-[15px] leading-relaxed text-madison-muted">
                                    Modelos, automatizaciones y APIs bajo una
                                    misma sesión. Entrá para operar tus agentes.
                                </p>
                            </div>

                            {!auth.user && (
                                <div className="flex flex-wrap items-center gap-4">
                                    {canLogin && (
                                        <Link
                                            href={route('login')}
                                            className="flex items-center gap-3 rounded-full bg-madison-blue px-7 py-[15px] text-[14.5px] font-semibold text-[#04101f] transition hover:bg-[#8fbcff]"
                                        >
                                            Iniciar sesión
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 16 16"
                                                fill="none"
                                            >
                                                <path
                                                    d="M2.5 8h11M9.5 4l4 4-4 4"
                                                    stroke="#04101f"
                                                    strokeWidth="1.8"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </Link>
                                    )}
                                    {canRegister && (
                                        <Link
                                            href={route('register')}
                                            className="text-[14.5px] font-medium text-madison-muted transition hover:text-madison-text"
                                        >
                                            Crear cuenta
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </main>

                    <footer className="px-8 pb-8 text-[11.5px] text-madison-faint sm:px-16">
                        DevNodo · ambiente de pruebas
                    </footer>
                </div>
            </div>
        </>
    );
}
