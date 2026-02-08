'use client';

import { login } from '@/app/actions/auth';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [message, setMessage] = useState('');
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        const result = await login(formData);
        if (result.success) {
             router.push('/dashboard'); 
             router.refresh();
        } else {
            setMessage(result.message || 'Login failed');
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <form action={handleSubmit} className="w-full max-w-sm p-6 border rounded-lg shadow-sm space-y-4">
                <h1 className="text-2xl font-bold text-center">Admin Login</h1>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <input 
                        type="password" 
                        name="password" 
                        required 
                        className="w-full p-2 border rounded bg-background" 
                        placeholder="Enter admin password"
                    />
                </div>
                <button className="w-full py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
                    Login
                </button>
                {message && <p className="text-red-500 text-sm text-center">{message}</p>}
            </form>
        </div>
    );
}
