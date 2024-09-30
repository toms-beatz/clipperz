'use client';

import { useState } from 'react';
import Link from 'next/link';

const SearchPage = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);

        const response = await fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
        });
        const data = await response.json();

        if (data.results) {
            setResults(data.results);
        } else {
            console.error(data.error);
        }
        setLoading(false);
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Recherche de Musique</h1>
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Entrez le nom de la musique"
                    style={{ padding: '10px', width: '300px' }}
                    required
                />
                <button type="submit" style={{ padding: '10px 20px' }}>Rechercher</button>
            </form>

            {loading && <p>Chargement...</p>}

            <div>
                {results.map((item, index) => (
                    <div key={index} style={{ margin: '20px 0' }}>
                        <h3>{item.title}</h3>
                        <video width="300" controls>
                            <source src={item.videoUrl} type="video/mp4" />
                            Votre navigateur ne supporte pas la vidéo.
                        </video>
                        <Link href={{
                            pathname: '/clip',
                            query: { url: item.url },
                        }}>
                            <button style={{ padding: '10px 20px' }}>Sélectionner</button>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchPage;