import { NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const resultsPerPage = 10;

    if (!query) {
        return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
    }

    try {
        const response = await new Promise((resolve, reject) => {
            const searchStream = spawn('yt-dlp', ['-j', '--flat-playlist', `ytsearch${resultsPerPage}:${query}`]);

            let data = '';

            searchStream.stdout.on('data', (chunk) => {
                data += chunk;
            });

            searchStream.on('close', (code) => {
                if (code === 0) {
                    const results = data
                        .split('\n')
                        .filter(Boolean) // Remove empty strings
                        .map(JSON.parse)
                        .map((video) => ({
                            id: video.id,
                            title: video.title,
                            url: video.url,
                        }));
                    resolve(results);
                } else {
                    reject(new Error(`yt-dlp exited with code ${code}`));
                }
            });

            searchStream.on('error', (error) => {
                reject(new Error(`Search failed: ${error.message}`));
            });
        });

        return NextResponse.json({ results: response });
    } catch (error) {
        console.error('Error searching videos:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}