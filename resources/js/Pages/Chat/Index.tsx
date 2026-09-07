import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    FormEvent,
    KeyboardEvent,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

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

export default function ChatIndex({
    clients,
    activeClientId,
    conversation,
    triggerExamples,
}: ChatPageProps) {
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

    const activeClient = useMemo(
        () => clients.find((client) => client.id === activeClientId) ?? null,
        [clients, activeClientId],
    );

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
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            Chat de marketing
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Escribí una instrucción y la automatización genera el
                            resultado sin recargar la página.
                        </p>
                    </div>
                    <Link
                        href={route('clients.create')}
                        className="inline-flex items-center justify-center rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-white"
                    >
                        Nueva marca
                    </Link>
                </div>
            }
        >
            <Head title="Chat" />

            <div className="py-6">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between">
                        <label className="flex w-full flex-col gap-1 text-sm text-gray-600 dark:text-gray-300 sm:max-w-sm">
                            Marca activa
                            <select
                                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                                value={activeClientId ?? ''}
                                onChange={(event) => {
                                    const nextId = Number(event.target.value);
                                    if (!Number.isNaN(nextId) && nextId > 0) {
                                        router.visit(
                                            route('chat.show', nextId),
                                            {
                                                preserveScroll: true,
                                            },
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
                                        >
                                            {client.name}
                                        </option>
                                    ))
                                )}
                            </select>
                        </label>

                        {activeClient ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Conversación para{' '}
                                <span className="font-medium text-gray-800 dark:text-gray-100">
                                    {activeClient.name}
                                </span>
                            </p>
                        ) : null}
                    </div>

                    {clients.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center dark:border-gray-600 dark:bg-gray-800">
                            <p className="text-gray-700 dark:text-gray-200">
                                Todavía no tenés marcas. Creá una para darle
                                contexto a la automatización.
                            </p>
                            <Link
                                href={route('clients.create')}
                                className="mt-4 inline-flex rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                            >
                                Crear marca
                            </Link>
                        </div>
                    ) : (
                        <div className="flex min-h-[70vh] flex-col overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
                            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
                                {messages.length === 0 ? (
                                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/60">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
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
                                                    className="rounded-full border border-gray-200 px-3 py-1 text-left text-sm text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-600 dark:text-gray-300"
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
                                    <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-300">
                                        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
                                        Generando con la automatización… puede
                                        tardar 20–30s
                                    </div>
                                ) : null}

                                {error ? (
                                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                                        {error}
                                    </div>
                                ) : null}

                                <div ref={bottomRef} />
                            </div>

                            <form
                                onSubmit={onSubmit}
                                className="border-t border-gray-100 p-4 dark:border-gray-700"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                    <textarea
                                        value={input}
                                        onChange={(event) =>
                                            setInput(event.target.value)
                                        }
                                        onKeyDown={onKeyDown}
                                        rows={3}
                                        placeholder="Ej: Créame un reel para Instagram sobre nuestra oferta..."
                                        disabled={
                                            isGenerating || !conversationId
                                        }
                                        className="w-full flex-1 resize-y rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                                    />
                                    <button
                                        type="submit"
                                        disabled={
                                            isGenerating ||
                                            !input.trim() ||
                                            !conversationId
                                        }
                                        className="inline-flex h-11 items-center justify-center rounded-md bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Enviar
                                    </button>
                                </div>
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    Enter para enviar · Shift+Enter para nueva
                                    línea
                                </p>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function MessageBubble({ message }: { message: ChatMessage }) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-3xl rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    isUser
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
                }`}
            >
                {isUser ? (
                    <p className="whitespace-pre-wrap">
                        {message.content?.text ?? ''}
                    </p>
                ) : message.error ? (
                    <p className="text-red-600 dark:text-red-300">
                        {message.error}
                    </p>
                ) : message.content?.text ? (
                    <p className="whitespace-pre-wrap">
                        {message.content.text}
                    </p>
                ) : (
                    <AssistantResult content={message.content} />
                )}
            </div>
        </div>
    );
}

function AssistantResult({ content }: { content: AssistantContent | null }) {
    if (!content) {
        return <p>Sin contenido.</p>;
    }

    return (
        <div className="space-y-4">
            {content.guion_markdown ? (
                <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Guion
                    </h3>
                    <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-white/70 p-3 font-sans text-sm leading-relaxed text-gray-800 dark:bg-black/20 dark:text-gray-100">
                        {content.guion_markdown}
                    </pre>
                </div>
            ) : null}

            {content.escenas && content.escenas.length > 0 ? (
                <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Escenas 9:16
                    </h3>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {content.escenas.map((scene, index) => (
                            <div
                                key={`${scene.numero ?? index}-${scene.titulo ?? 'scene'}`}
                                className="w-40 shrink-0"
                            >
                                <p className="mb-1 truncate text-xs font-medium">
                                    {scene.numero ? `${scene.numero}. ` : ''}
                                    {scene.titulo ?? `Escena ${index + 1}`}
                                </p>
                                <div className="aspect-[9/16] overflow-hidden rounded-md border border-gray-200 bg-black dark:border-gray-700">
                                    {scene.html ? (
                                        <iframe
                                            title={
                                                scene.titulo ??
                                                `Escena ${index + 1}`
                                            }
                                            sandbox=""
                                            srcDoc={scene.html}
                                            className="h-full w-full border-0"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-xs text-gray-400">
                                            Sin HTML
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {content.pendientes && content.pendientes.length > 0 ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                    <p className="text-xs font-semibold uppercase tracking-wide">
                        Pendientes de marca
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-4">
                        {content.pendientes.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </div>
            ) : null}
        </div>
    );
}
