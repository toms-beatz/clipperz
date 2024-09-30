import { spawn } from 'child_process';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page')) || 1;
  const resultsPerPage = 10;

  // Implémentez votre logique de recherche ici
  // Utilisez yt-dlp ou une autre méthode pour rechercher les vidéos

  const videoResults = []; // Remplacez ceci par les résultats de votre recherche
  let totalResults = 0; // Total des résultats pour la pagination

  try {
    // Exemple d'utilisation de yt-dlp pour rechercher des vidéos
    const searchStream = spawn('yt-dlp', ['-e', '--flat-playlist', '--get-title', '--get-id', query]);

    searchStream.stdout.on('data', (data) => {
      const lines = data.toString().trim().split('\n');
      lines.forEach((line) => {
        const [title, id] = line.split('\t');
        videoResults.push({ title, id, url: `https://www.youtube.com/watch?v=${id}` });
      });
      totalResults = videoResults.length;
    });

    await new Promise((resolve, reject) => {
      searchStream.on('close', () => {
        resolve();
      });
      searchStream.on('error', (error) => {
        reject(new Error(`Search failed: ${error.message}`));
      });
    });

    const paginatedResults = videoResults.slice((page - 1) * resultsPerPage, page * resultsPerPage);
    
    return new Response(JSON.stringify({ results: paginatedResults, totalResults }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error during search:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}