import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';

type ClientOption = {
    id: number;
    name: string;
    slug: string;
};

type AssistantContent = {
    text?: string;
    guion_markdown?: string;
    escenas?: Array<{
        numero?: number;
        titulo?: string;
        html?: string;
    }>;
    pendientes?: string[];
    fuentes?: string[];
};

type ChatMessage = {
    id: number | string;
    role: 'user' | 'assistant' | 'system';
    content: AssistantContent | null;
    flow_slug?: string | null;
    error?: string | null;
    created_at?: string | null;
};

type ConversationPayload = {
    id: number;
    client_id: number;
    title: string | null;
    messages: ChatMessage[];
};

type ChatPageProps = {
    clients: ClientOption[];
    activeClientId: number | null;
    conversation: ConversationPayload | null;
    triggerExamples: string[];
};

function csrfToken(): string {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? ''
    );
}

function getXsrfToken(): string {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);

    return match ? decodeURIComponent(match[1]) : '';
}

function initials(name: string): string {
    const parts = name.trim().split(/\s+/);

    return (
        (parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts[1][0] ?? '') : '')
    ).toUpperCase();
}

export default function ChatIndex({
    clients,
    activeClientId,
    conversation,
    triggerExamples,
}: ChatPageProps) {
    const user = usePage().props.auth.user;

    const [messages, setMessages] = useState<ChatMessage[]>(
        conversation?.messages ?? [],
    );
    const [conversationId, setConversationId] = useState<number | null>(
        conversation?.id ?? null,
    );
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setMessages(conversation?.messages ?? []);
        setConversationId(conversation?.id ?? null);
        setError(null);
    }, [conversation]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isGenerating]);

    const sendMessage = async (rawText: string) => {
        const text = rawText.trim();

        if (!text || !conversationId || isGenerating) {
            return;
        }

        setError(null);
        setIsGenerating(true);

        const optimisticId = `local-${Date.now()}`;
        setMessages((current) => [
            ...current,
            {
                id: optimisticId,
                role: 'user',
                content: { text },
            },
        ]);
        setInput('');

        try {
            const response = await fetch(
                `/api/conversations/${conversationId}/messages`,
                {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken(),
                        'X-XSRF-TOKEN': getXsrfToken(),
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({ content: text }),
                },
            );

            const payload = await response.json();

            if (!response.ok) {
                const message =
                    typeof payload?.message === 'string'
                        ? payload.message
                        : 'No se pudo enviar el mensaje. Intentá de nuevo.';
                throw new Error(message);
            }

            setMessages((current) => [
                ...current.filter((message) => message.id !== optimisticId),
                {
                    id: Date.now(),
                    role: 'user',
                    content: { text },
                },
                payload.message,
            ]);
        } catch (sendError) {
            setMessages((current) =>
                current.filter((message) => message.id !== optimisticId),
            );
            setInput(text);
            setError(
                sendError instanceof Error
                    ? sendError.message
                    : 'Error inesperado al generar la respuesta.',
            );
        } finally {
            setIsGenerating(false);
        }
    };

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        void sendMessage(input);
    };

    const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            void sendMessage(input);
        }
    };

    return (
        <div className="flex h-screen bg-madison-bg font-jakarta text-madison-text">
            <Head title="Chat" />

            <aside className="flex w-[248px] flex-none flex-col border-r border-white/[.07] bg-madison-surface">
                <div className="flex items-center gap-2.5 border-b border-white/[.06] px-[18px] py-5">
                    <ApplicationLogo className="h-[26px] w-[26px]" />
                    <span className="font-display text-[14.5px] font-bold">
                        madison<span className="text-madison-blue">.ai</span>
                    </span>
                </div>

                <nav className="flex flex-col gap-1 px-3 py-4">
                    <div className="px-2 py-1.5 font-display text-[10px] font-semibold uppercase tracking-[.16em] text-madison-faint">
                        Trabajo
                    </div>
                    <div className="flex items-center gap-2.5 rounded-[9px] border border-madison-blue/[.22] bg-madison-blue/10 px-2.5 py-2.5 text-[13px] font-semibold text-madison-text">
                        <span className="h-1.5 w-1.5 rounded-sm bg-madison-blue" />
                        Chat
                    </div>
                    <Link
                        href={route('clients.index')}
                        className="flex items-center gap-2.5 rounded-[9px] px-2.5 py-2.5 text-[13px] font-medium text-madison-muted hover:bg-white/5 hover:text-madison-text"
                    >
                        <span className="h-1.5 w-1.5 rounded-sm bg-madison-muted/40" />
                        Marcas
                    </Link>
                </nav>

                <div className="mt-auto border-t border-white/[.06] p-3.5">
                    <Dropdown>
                        <Dropdown.Trigger>
                            <div className="flex cursor-pointer items-center gap-2.5 rounded-[9px] px-1 py-1 hover:bg-white/5">
                                <div className="flex h-8 w-8 flex-none items-center justify-center rounded-[9px] bg-gradient-to-br from-[#3b82f6] to-madison-violet font-display text-xs font-semibold text-[#04101f]">
                                    {initials(user.name) || '·'}
                                </div>
                                <div className="flex min-w-0 flex-col gap-0.5 text-left">
                                    <span className="truncate text-[12.5px] font-semibold text-madison-text">
                                        {user.name}
                                    </span>
                                    <span className="truncate text-[11px] text-madison-dim">
                                        {user.email}
                                    </span>
                                </div>
                            </div>
                        </Dropdown.Trigger>
                        <Dropdown.Content
                            align="left"
                            placement="top"
                            contentClasses="py-1 bg-madison-panel border border-white/10"
                        >
                            <Dropdown.Link
                                href={route('profile.edit')}
                                className="!text-madison-muted hover:!bg-white/5 hover:!text-madison-text"
                            >
                                Perfil
                            </Dropdown.Link>
                            <Dropdown.Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="!text-madison-muted hover:!bg-white/5 hover:!text-madison-text"
                            >
                                Cerrar sesión
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex flex-none flex-col gap-3 border-b border-white/[.07] bg-madison-surface/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="font-display text-[15px] font-semibold">
                            Chat de marketing
                        </h1>
                        <p className="text-xs text-madison-dim">
                            Escribí una instrucción y la automatización genera
                            el resultado sin recargar la página.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <label className="relative flex items-center gap-2 rounded-[10px] border border-white/[.09] bg-madison-panel px-3 py-2.5 text-[12.5px] font-medium">
                            <span className="h-[7px] w-[7px] flex-none rounded-full bg-madison-blue" />
                            <select
                                className="appearance-none bg-transparent pr-4 text-madison-text outline-none"
                                value={activeClientId ?? ''}
                                onChange={(event) => {
                                    const nextId = Number(event.target.value);
                                    if (!Number.isNaN(nextId) && nextId > 0) {
                                        router.visit(
                                            route('chat.show', nextId),
                                            { preserveScroll: true },
                                        );
                                    }
                                }}
                                disabled={clients.length === 0}
                            >
                                {clients.length === 0 ? (
                                    <option value="">
                                        Creá una marca para empezar
                                    </option>
                                ) : (
                                    clients.map((client) => (
                                        <option
                                            key={client.id}
                                            value={client.id}
                                            className="bg-madison-panel text-madison-text"
                                        >
                                            {client.name}
                                        </option>
                                    ))
                                )}
                            </select>
                            <svg
                                className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2"
                                viewBox="0 0 12 12"
                                fill="none"
                            >
                                <path
                                    d="M3 4.8 6 7.8 9 4.8"
                                    stroke="#6b7a92"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </label>

                        <Link
                            href={route('clients.create')}
                            className="rounded-[10px] border border-white/[.12] px-3.5 py-2.5 text-[12.5px] font-medium text-madison-muted transition hover:border-madison-blue/50 hover:text-madison-text"
                        >
                            Nueva marca
                        </Link>
                    </div>
                </header>

                {clients.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center p-8">
                        <div className="max-w-sm rounded-2xl border border-dashed border-white/[.14] p-8 text-center">
                            <p className="text-madison-muted">
                                Todavía no tenés marcas. Creá una para darle
                                contexto a la automatización.
                            </p>
                            <Link
                                href={route('clients.create')}
                                className="mt-4 inline-flex rounded-[10px] bg-gradient-to-r from-[#3b82f6] via-madison-blue to-madison-violet px-4 py-2.5 text-sm font-semibold text-[#04101f]"
                            >
                                Crear marca
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-6">
                            {messages.length === 0 ? (
                                <div className="rounded-2xl border border-white/[.07] bg-madison-surface/60 p-4">
                                    <p className="text-sm font-medium text-madison-text">
                                        Probá con una instrucción como:
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {triggerExamples.map((example) => (
                                            <button
                                                key={example}
                                                type="button"
                                                onClick={() =>
                                                    setInput(example)
                                                }
                                                className="rounded-full border border-white/10 px-3 py-1.5 text-left text-[12.5px] text-madison-muted transition hover:border-madison-blue/50 hover:text-madison-text"
                                            >
                                                {example}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            {messages.map((message) => (
                                <MessageBubble
                                    key={String(message.id)}
                                    message={message}
                                />
                            ))}

                            {isGenerating ? (
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[9px] border border-madison-blue/25 bg-madison-surface">
                                        <svg
                                            className="h-[15px] w-[15px] animate-spin"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                        >
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="9"
                                                stroke="rgba(91,156,255,.2)"
                                                strokeWidth="3"
                                            />
                                            <path
                                                d="M21 12a9 9 0 0 0-9-9"
                                                stroke="#5b9cff"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-[12.5px] font-medium text-madison-blue">
                                        Generando con la automatización… puede
                                        tardar 20–30s
                                    </p>
                                </div>
                            ) : null}

                            {error ? (
                                <div className="rounded-[10px] border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
                                    {error}
                                </div>
                            ) : null}

                            <div ref={bottomRef} />
                        </div>

                        <form
                            onSubmit={onSubmit}
                            className="flex-none border-t border-white/[.07] bg-madison-surface/40 px-6 py-4"
                        >
                            <div className="flex items-end gap-3 rounded-[14px] border border-white/10 bg-madison-panel p-3 pl-4">
                                <textarea
                                    value={input}
                                    onChange={(event) =>
                                        setInput(event.target.value)
                                    }
                                    onKeyDown={onKeyDown}
                                    rows={2}
                                    placeholder="Escribí una instrucción para el agente…"
                                    disabled={isGenerating || !conversationId}
                                    className="min-w-0 flex-1 resize-none bg-transparent text-[13.5px] text-madison-text outline-none placeholder:text-madison-faint disabled:opacity-60"
                                />
                                <button
                                    type="submit"
                                    disabled={
                                        isGenerating ||
                                        !input.trim() ||
                                        !conversationId
                                    }
                                    className="flex-none rounded-[11px] bg-gradient-to-r from-[#3b82f6] to-madison-violet px-[18px] py-[11px] text-[13px] font-semibold text-[#04101f] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Enviar
                                </button>
                            </div>
                            <p className="mt-2 text-[11px] text-madison-faint">
                                Enter para enviar · Shift+Enter para nueva línea
                            </p>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

function MessageBubble({ message }: { message: ChatMessage }) {
    const isUser = message.role === 'user';

    if (isUser) {
        return (
            <div className="flex justify-end">
                <div className="max-w-[60%] rounded-[16px] rounded-tr-[6px] bg-gradient-to-r from-[#2563eb] to-madison-blue px-4 py-3 text-[13.5px] font-medium text-[#04101f] shadow-sm">
                    <p className="whitespace-pre-wrap">
                        {message.content?.text ?? ''}
                    </p>
                </div>
            </div>
        );
    }

    if (message.error) {
        return (
            <div className="flex gap-3">
                <AgentAvatar />
                <div className="max-w-3xl rounded-[16px] rounded-tl-[6px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {message.error}
                </div>
            </div>
        );
    }

    if (message.content?.text) {
        return (
            <div className="flex gap-3">
                <AgentAvatar />
                <div className="max-w-3xl rounded-[16px] rounded-tl-[6px] bg-madison-surface px-4 py-3 text-[13.5px] leading-relaxed text-madison-text">
                    <p className="whitespace-pre-wrap">
                        {message.content.text}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-start gap-3">
            <AgentAvatar />
            <div className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-white/[.08] bg-madison-surface">
                <div className="flex items-center justify-between gap-4 border-b border-white/[.06] px-[18px] py-3.5">
                    <div className="flex items-center gap-2.5 text-[12.5px] font-semibold text-madison-text">
                        Resultado del agente
                        <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 font-display text-[10.5px] font-medium uppercase tracking-[.08em] text-emerald-400">
                            Listo
                        </span>
                    </div>
                    {message.flow_slug ? (
                        <div className="text-[11.5px] text-madison-faint">
                            flow: {message.flow_slug}
                        </div>
                    ) : null}
                </div>

                <AssistantResult content={message.content} />
            </div>
        </div>
    );
}

function AgentAvatar() {
    return (
        <div className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[9px] border border-madison-blue/25 bg-madison-surface">
            <ApplicationLogo className="h-4 w-4" />
        </div>
    );
}

function AssistantResult({ content }: { content: AssistantContent | null }) {
    if (!content) {
        return (
            <p className="p-[18px] text-sm text-madison-muted">
                Sin contenido.
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-[18px] p-[18px]">
            {content.guion_markdown ? (
                <div className="flex flex-col gap-2.5">
                    <div className="font-display text-[10px] font-semibold uppercase tracking-[.16em] text-madison-dim">
                        Guion
                    </div>
                    <pre className="overflow-x-auto whitespace-pre-wrap rounded-[11px] bg-madison-panel p-4 font-jakarta text-[13px] leading-[1.65] text-madison-text">
                        {content.guion_markdown}
                    </pre>
                </div>
            ) : null}

            {content.escenas && content.escenas.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                    <div className="font-display text-[10px] font-semibold uppercase tracking-[.16em] text-madison-dim">
                        Escenas 9:16
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
                        {content.escenas.map((scene, index) => (
                            <div
                                key={`${scene.numero ?? index}-${scene.titulo ?? 'scene'}`}
                                className="flex flex-col gap-1.5"
                            >
                                <div
                                    className="relative flex aspect-[9/16] items-end overflow-hidden rounded-[9px] border border-white/[.09] p-2.5"
                                    style={{
                                        background:
                                            'linear-gradient(165deg,#152240,#070b14)',
                                    }}
                                >
                                    <div
                                        className="absolute inset-0 opacity-50"
                                        style={{
                                            backgroundImage:
                                                'radial-gradient(rgba(91,156,255,.2) 1.2px, transparent 1.2px)',
                                            backgroundSize: '14px 14px',
                                        }}
                                    />
                                    {scene.html ? (
                                        <iframe
                                            title={
                                                scene.titulo ??
                                                `Escena ${index + 1}`
                                            }
                                            sandbox=""
                                            srcDoc={scene.html}
                                            className="absolute inset-0 h-full w-full border-0"
                                        />
                                    ) : (
                                        <div className="relative font-display text-[10px] font-semibold leading-tight text-madison-muted">
                                            {scene.titulo ??
                                                `Escena ${index + 1}`}
                                        </div>
                                    )}
                                </div>
                                <div className="truncate text-[10px] text-madison-faint">
                                    {scene.numero ? `${scene.numero}. ` : ''}
                                    {scene.titulo ?? `Escena ${index + 1}`}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {content.pendientes && content.pendientes.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-[10px] font-semibold uppercase tracking-[.16em] text-madison-dim">
                        Pendientes
                    </span>
                    {content.pendientes.map((item) => (
                        <span
                            key={item}
                            className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1.5 text-[11.5px] font-medium text-amber-400"
                        >
                            {item}
                        </span>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
