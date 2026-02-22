export async function GET() {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || '';

  if (!publisherId) {
    return new Response('No publisher ID configured', { status: 404 });
  }

  // Ensure it uses the 'pub-' prefix for ads.txt
  let id = publisherId;
  if (id.startsWith('ca-pub-')) {
    id = id.replace('ca-pub-', 'pub-');
  } else if (!id.startsWith('pub-')) {
    id = `pub-${id}`;
  }

  // Required format for Google AdSense ads.txt
  const content = `google.com, ${id}, DIRECT, f08c47fec0942fa0\n`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
