import { spawn } from 'child_process';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
    const { url, start, duration } = await req.json();

    // Vérification des paramètres
    if (!url) {
        return NextResponse.json({ error: 'Video URL is required.' }, { status: 400 });
    }

    if (isNaN(start) || isNaN(duration) || start < 0 || duration <= 0) {
        return NextResponse.json({ error: 'Start and duration must be positive numbers.' }, { status: 400 });
    }

    const tempVideoPath = path.join(process.cwd(), 'public/tmp/temp_video.mp4');
    const clipId = uuidv4(); // Générer un nouvel UUID pour le clip
    const outputClipPath = path.join(process.cwd(), 'public/clips/clip-' + clipId + '.mp4');
    

    try {
        // Téléchargement de la vidéo
        await new Promise((resolve, reject) => {
            const videoStream = spawn('yt-dlp', [
                '-o', tempVideoPath,
                '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]', // Forcer le format
                '--merge-output-format', 'mp4',
                '-v',
                url,
            ]);

            videoStream.on('close', (code) => {
                if (code === 0) {
                    console.log('Video downloaded successfully.');
                    resolve();
                } else {
                    reject(new Error(`yt-dlp process exited with code ${code}`));
                }
            });

            videoStream.on('error', (error) => {
                console.error('Error during video download:', error);
                reject(new Error(`Download failed: ${error.message}`));
            });
        });

        // Clipper et recadrer la vidéo au format 9:16
        await new Promise((resolve, reject) => {
            const clipStream = spawn('ffmpeg', [
                '-i', tempVideoPath,
                '-ss', start,
                '-t', duration,
                '-vf', 'crop=ih*9/16:ih', // Recadrage au format 9:16
                '-c:a', 'aac', // Codec audio
                outputClipPath,
            ]);

            clipStream.stdout.on('data', (data) => {
                console.log(`ffmpeg stdout: ${data}`);
            });

            clipStream.stderr.on('data', (data) => {
                console.error(`ffmpeg stderr: ${data}`); // Afficher la sortie d'erreur
            });

            clipStream.on('close', (code) => {
                if (code === 0) {
                    console.log('Clip created successfully.');
                    resolve();
                } else {
                    reject(new Error(`ffmpeg process exited with code ${code}`));
                }
            });

            clipStream.on('error', (error) => {
                console.error('Error during video clipping:', error);
                reject(new Error(`Clipping failed: ${error.message}`));
            });
        });

        // Supprimer le fichier temporaire
        fs.unlinkSync(tempVideoPath); // Supprime le fichier temporaire

        // Envoyer une réponse réussie
        return NextResponse.json({ message: 'Clip created successfully.', clipId: clipId, clipPath: outputClipPath });

    } catch (error) {
        console.error('Error processing video:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}