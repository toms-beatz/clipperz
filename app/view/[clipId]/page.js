'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const ViewClip = () => {
    let clipId = usePathname();
    const [clipPath, setClipPath] = useState('');

    useEffect(() => {
        // Vérifier si clipId est défini avant de l'utiliser
        if (clipId) {
            clipId = clipId.split('/view/').join('');
            setClipPath(`/clips/clip-${clipId}.mp4`); // Utilisez votre logique pour obtenir le chemin réel
        }
    }, [clipId]);

    const downloadClip = () => {
        const link = document.createElement('a');
        link.href = clipPath;
        link.download = `clip-${clipId}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
            <h1 className="text-3xl font-bold mb-4 text-black">Visualiser le Clip</h1>
            {clipPath ? (
                <div className="bg-white rounded-lg shadow-lg p-4 mb-4 max-w-xs mx-auto">
                    <video className="w-full rounded" controls>
                        <source src={clipPath} type="video/mp4" />
                        Votre navigateur ne supporte pas la lecture de vidéos.
                    </video>
                    <div className="flex justify-center mt-4">
                       
                        <button
                            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                            onClick={downloadClip}
                        >
                            Télécharger le Clip
                        </button>
                    </div>
                </div>
            ) : (
                <p>Chargement du clip...</p>
            )}
        </div>
    );
};

export default ViewClip;