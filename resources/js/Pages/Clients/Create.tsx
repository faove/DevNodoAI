import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

export default function ClientsCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        tono: 'cercano y profesional',
        oferta: '',
        etapa_funnel: 'consideracion',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(route('clients.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Nueva marca
                </h2>
            }
        >
            <Head title="Nueva marca" />

            <div className="py-8">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <form
                        onSubmit={submit}
                        className="space-y-5 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800"
                    >
                        <div>
                            <InputLabel htmlFor="name" value="Nombre de la marca" />
                            <TextInput
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                                required
                                autoFocus
                            />
                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div>
                            <InputLabel htmlFor="tono" value="Tono" />
                            <TextInput
                                id="tono"
                                className="mt-1 block w-full"
                                value={data.tono}
                                onChange={(event) =>
                                    setData('tono', event.target.value)
                                }
                            />
                            <InputError className="mt-2" message={errors.tono} />
                        </div>

                        <div>
                            <InputLabel htmlFor="oferta" value="Oferta vigente" />
                            <textarea
                                id="oferta"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                                rows={4}
                                value={data.oferta}
                                onChange={(event) =>
                                    setData('oferta', event.target.value)
                                }
                            />
                            <InputError
                                className="mt-2"
                                message={errors.oferta}
                            />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="etapa_funnel"
                                value="Etapa de funnel"
                            />
                            <TextInput
                                id="etapa_funnel"
                                className="mt-1 block w-full"
                                value={data.etapa_funnel}
                                onChange={(event) =>
                                    setData('etapa_funnel', event.target.value)
                                }
                            />
                            <InputError
                                className="mt-2"
                                message={errors.etapa_funnel}
                            />
                        </div>

                        <div className="flex justify-end">
                            <PrimaryButton disabled={processing}>
                                Crear y abrir chat
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
