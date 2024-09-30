'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const [videoUrl, setVideoUrl] = useState('');
    const [start, setStart] = useState('');
    const [duration, setDuration] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter(); // Pour la redirection

    const handleDownload = async () => {
        try {
            const response = await fetch('/api/youtube/clip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: videoUrl, start, duration }),
            });

            const data = await response.json();
            if (response.ok) {
                // Rediriger vers la page de visualisation avec l'ID du clip
                router.push(`/view/${data.clipId}`); // Utilisez le clipId renvoyé
            } else {
                setMessage(data.error);
            }
        } catch (error) {
            console.error('Error downloading video:', error);
            setMessage('Failed to download video.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-4xl font-bold mb-6 text-black">Video Clipperz</h1>
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="Entrez l'URL de la vidéo YouTube"
                    className="border border-gray-300 rounded p-2 mb-4 w-full"
                />
                <input
                    type="text"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    placeholder="Démarrer à (en secondes)"
                    className="border border-gray-300 rounded p-2 mb-4 w-full"
                />
                <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Durée du clip (en secondes)"
                    className="border border-gray-300 rounded p-2 mb-4 w-full"
                />
                <button
                    onClick={handleDownload}
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                >
                    Générer le clip
                </button>
                {message && <p className="text-red-500 mt-4">{message}</p>}
            </div>
        </div>
    );
}