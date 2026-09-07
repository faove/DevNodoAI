import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-madison-bg px-4 py-10 font-jakarta">
            <div
                className="pointer-events-none absolute inset-0 opacity-50"
                style={{
                    backgroundImage:
                        'radial-gradient(rgba(91,156,255,.16) 1.6px, transparent 1.6px)',
                    backgroundSize: '34px 34px',
                }}
            />
            <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[520px] w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,.28),transparent_65%)] blur-[10px]" />
            <div className="pointer-events-none absolute bottom-[-220px] right-[-120px] h-[520px] w-[620px] bg-[radial-gradient(ellipse_at_center,rgba(139,123,255,.18),transparent_65%)]" />

            <div className="relative flex w-full max-w-[432px] flex-col items-center gap-7">
                <div className="flex flex-col items-center gap-4">
                    <Link href="/">
                        <ApplicationLogo className="h-11 w-11" />
                    </Link>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="font-display text-[27px] font-bold tracking-tight text-madison-text">
                            Madison AI
                        </div>
                        <div className="text-sm text-madison-muted">
                            Tu equipo de agentes de IA, en una sola interfaz.
                        </div>
                    </div>
                </div>

                <div className="w-full rounded-2xl border border-white/[.09] bg-madison-panel/60 p-7 shadow-[0_30px_80px_rgba(0,0,0,.5)]">
                    {children}
                </div>

                <div className="flex gap-4 text-[11.5px] text-madison-faint">
                    <span>Desarrollado por DevNodo</span>
                    <span>·</span>
                    <span>Ambiente de pruebas</span>
                </div>
            </div>
        </div>
    );
}
