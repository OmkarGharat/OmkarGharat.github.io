'use server';

import fs from 'fs/promises';
import path from 'path';
import { readdir } from 'fs/promises';

export async function createNote(formData: FormData) {
    const title = formData.get('title') as string;
    const folder = formData.get('folder') as string;
    const filename = formData.get('filename') as string;
    const content = formData.get('content') as string;
    const collection = formData.get('collection') as string; // 'blog' or 'docs'

    if (!title || !filename || !content || !collection) {
        return { success: false, message: 'Missing required fields' };
    }

    // Sanitize filename
    const safeFilename = filename.replace(/[^a-z0-9-]/gi, '-').toLowerCase() + '.mdx';

    // Construct path
    const baseDir = path.join(process.cwd(), 'content', collection);
    const targetDir = folder ? path.join(baseDir, folder) : baseDir;
    const filePath = path.join(targetDir, safeFilename);

    try {
        // Ensure directory exists
        await fs.mkdir(targetDir, { recursive: true });

        // Check if file exists
        try {
            await fs.access(filePath);
            return { success: false, message: 'File already exists' };
        } catch {
            // File implies not exists, proceed
        }

        // Frontmatter
        const fileContent = `---
title: ${title}
description: ${title}
date: ${new Date().toISOString().split('T')[0]}
---

${content}`;

        await fs.writeFile(filePath, fileContent);
        return { success: true, message: `Note created at ${collection}/${folder ? folder + '/' : ''}${safeFilename}` };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Failed to create note' };
    }
}

export async function getFolders(collection: string) {
    const baseDir = path.join(process.cwd(), 'content', collection);
    try {
        const entries = await readdir(baseDir, { withFileTypes: true });
        return entries
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
    } catch {
        return [];
    }
}
