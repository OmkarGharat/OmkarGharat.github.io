'use client';

import { useState } from 'react';
import CreateNoteForm from './create-note-form';
import { exportContent, importContent } from '@/app/actions/admin-data';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'create' | 'data'>('create');
    const [exportStatus, setExportStatus] = useState('');
    const [importStatus, setImportStatus] = useState('');

    async function handleExport() {
        setExportStatus('Exporting...');
        const result = await exportContent();
        if (result.success && result.url) {
            setExportStatus('Export Ready!');
            // Trigger download
            const a = document.createElement('a');
            a.href = result.url;
            a.download = result.url.split('/').pop() || 'backup.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            setExportStatus('Export Failed.');
        }
    }

    async function handleImport(formData: FormData) {
        setImportStatus('Importing...');
        const result = await importContent(formData);
        setImportStatus(result.message || (result.success ? 'Success!' : 'Failed'));
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <div className="flex border-b">
                <button
                    className={`px-6 py-3 font-medium ${activeTab === 'create' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`}
                    onClick={() => setActiveTab('create')}
                >
                    Create Note
                </button>
                <button
                    className={`px-6 py-3 font-medium ${activeTab === 'data' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`}
                    onClick={() => setActiveTab('data')}
                >
                    Data Management
                </button>
            </div>

            {activeTab === 'create' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <CreateNoteForm />
                </div>
            )}

            {activeTab === 'data' && (
                <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Export Section */}
                    <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                        <h2 className="text-2xl font-bold mb-4">Export Content</h2>
                        <p className="text-muted-foreground mb-6">
                            Download a full backup of your content (docs & blog) as a ZIP file.
                        </p>
                        <button
                            onClick={handleExport}
                            className="w-full py-2 px-4 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors"
                        >
                            Download All Content
                        </button>
                        {exportStatus && <p className="mt-4 text-center text-sm font-medium">{exportStatus}</p>}
                    </div>

                    {/* Import Section */}
                    <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                        <h2 className="text-2xl font-bold mb-4">Import Content</h2>
                        <p className="text-muted-foreground mb-6">
                            Upload a ZIP file containing markdown files. The structure should match the <code>content/</code> folder.
                        </p>
                        <form action={handleImport} className="space-y-4">
                            <input
                                type="file"
                                name="file"
                                accept=".zip"
                                required
                                className="w-full p-2 border rounded bg-background"
                            />
                            <button
                                type="submit"
                                className="w-full py-2 px-4 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                            >
                                Import ZIP
                            </button>
                        </form>
                        {importStatus && <p className="mt-4 text-center text-sm font-medium">{importStatus}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}
