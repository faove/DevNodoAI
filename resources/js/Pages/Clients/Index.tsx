import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

type ClientRow = {
    id: number;
    name: string;
    slug: string;
    tono?: string | null;
};

export default function ClientsIndex({ clients }: { clients: ClientRow[] }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Marcas
                    </h2>
                    <Link
                        href={route('clients.create')}
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                    >
                        Nueva marca
                    </Link>
                </div>
            }
        >
            <Head title="Marcas" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl space-y-3 px-4 sm:px-6 lg:px-8">
                    {clients.length === 0 ? (
                        <div className="rounded-lg bg-white p-6 text-gray-600 shadow-sm dark:bg-gray-800 dark:text-gray-300">
                            No hay marcas todavía.
                        </div>
                    ) : (
                        clients.map((client) => (
                            <div
                                key={client.id}
                                className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {client.name}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {client.slug}
                                        {client.tono ? ` · ${client.tono}` : ''}
                                    </p>
                                </div>
                                <Link
                                    href={route('chat.show', client.id)}
                                    className="inline-flex rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                                >
                                    Abrir chat
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
