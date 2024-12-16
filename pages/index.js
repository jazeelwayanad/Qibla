import QiblaFinder from '../components/QiblaFinder';
import Head from 'next/head';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Head>
        <title>Qibla Finder</title>
        <meta name="description" content="Find the direction to Mecca in real-time" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <QiblaFinder />
    </div>
  );
}