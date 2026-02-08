import CreateNoteForm from '@/components/admin/create-note-form';

export default function Page() {
    return (
        <div className="container py-12 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center">Create New Note</h1>
            <CreateNoteForm />
        </div>
    );
}
