'use client';

import { useState, useEffect } from 'react';
import { createNote, getFolders } from '@/app/actions/create-note';

export default function CreateNoteForm() {
    const [collection, setCollection] = useState('docs');
    const [folders, setFolders] = useState<string[]>([]);
    const [selectedFolder, setSelectedFolder] = useState('');
    const [newFolder, setNewFolder] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        getFolders(collection).then(setFolders);
    }, [collection]);

    async function handleSubmit(formData: FormData) {
        setMessage('Creating...');
        
        // Handle folder logic
        if (newFolder) {
            formData.set('folder', newFolder);
        } else {
            formData.set('folder', selectedFolder);
        }

        const result = await createNote(formData);
        setMessage(result.message);
        if (result.success) {
            setNewFolder('');
            setSelectedFolder('');
            // Optional: Redirect or clear form
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4 max-w-md mx-auto p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
            <h2 className="text-2xl font-bold">Create New Note</h2>
            
            <div className="space-y-2">
                <label className="block text-sm font-medium">Collection</label>
                <select 
                    name="collection" 
                    value={collection} 
                    onChange={(e) => setCollection(e.target.value)}
                    className="w-full p-2 border rounded bg-background"
                >
                    <option value="docs">Docs</option>
                    <option value="blog">Blog</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium">Folder</label>
                <div className="flex gap-2">
                    <select 
                        className="w-full p-2 border rounded bg-background"
                        value={selectedFolder}
                        onChange={(e) => { setSelectedFolder(e.target.value); setNewFolder(''); }}
                        disabled={!!newFolder}
                    >
                        <option value="">Root (No Folder)</option>
                        {folders.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
                <div className="mt-2">
                    <input 
                        type="text" 
                        placeholder="Or create new folder..." 
                        className="w-full p-2 border rounded bg-background"
                        value={newFolder}
                        onChange={(e) => { setNewFolder(e.target.value); setSelectedFolder(''); }}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium">Title</label>
                <input type="text" name="title" required className="w-full p-2 border rounded bg-background" />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium">Filename (slug)</label>
                <input type="text" name="filename" required className="w-full p-2 border rounded bg-background" />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium">Content</label>
                <textarea name="content" rows={5} required className="w-full p-2 border rounded bg-background"></textarea>
            </div>

            <button type="submit" className="w-full py-2 px-4 bg-primary text-primary-foreground rounded hover:bg-primary/90">
                Create Note
            </button>

            {message && <p className="text-sm mt-2 text-center">{message}</p>}
        </form>
    );
}
