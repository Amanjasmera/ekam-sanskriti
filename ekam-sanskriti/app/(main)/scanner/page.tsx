'use client';
import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useRouter } from 'next/navigation';
import { getDictionary } from '@/lib/i18n';
import { SUPPORTED_LANGUAGES } from '@/lib/wikipedia';
import { createClient } from '@/utils/supabase/client';

export default function QRScannerPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const router = useRouter();
  const [langCode, setLangCode] = useState<string>('en');

  useEffect(() => {
    async function loadLang() {
      if (typeof window !== 'undefined') {
        const localLang = localStorage.getItem('chosen_language');
        if (localLang) {
          const matched = SUPPORTED_LANGUAGES.find(
            l => l.code.toLowerCase() === localLang.toLowerCase().trim()
          );
          if (matched) setLangCode(matched.code);
        }
      }
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('chosen_language').eq('id', user.id).maybeSingle();
        if (data?.chosen_language) {
          const matched = SUPPORTED_LANGUAGES.find(
            l => l.code.toLowerCase() === data.chosen_language.toLowerCase().trim()
          );
          if (matched) setLangCode(matched.code);
        }
      }
    }
    loadLang();
  }, []);

  const dict = getDictionary(langCode);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: { width: 250, height: 250 },
      fps: 5,
    }, false);

    scanner.render((result) => {
      setScanResult(result);
      scanner.clear();
      // If it's a monument URL, parse it and navigate
      if (result.includes('/monument/')) {
        const path = new URL(result).pathname;
        router.push(path);
      }
    }, () => {
      // Ignored
    });

    return () => {
      scanner.clear().catch(e => console.error("Failed to clear scanner", e));
    };
  }, [router]);

  return (
    <div className="p-8 max-w-2xl mx-auto text-center flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-4 text-saffron-600">{dict.scannerPage.title}</h1>
      <p className="text-gray-600 mb-8">{dict.scannerPage.subtitle}</p>
      
      <div className="w-full max-w-sm rounded-xl overflow-hidden shadow-lg border-4 border-saffron-500 relative">
        <div id="reader" className="w-full"></div>
      </div>

      {scanResult && (
        <div className="mt-8 bg-green-50 p-4 rounded-lg border border-green-200 w-full">
          <p className="text-green-800 font-semibold mb-2">{dict.scannerPage.scanSuccess}</p>
          <p className="text-sm break-all">{scanResult}</p>
        </div>
      )}

      <div className="mt-12 bg-white p-6 rounded-xl border w-full text-left">
        <h3 className="font-bold mb-4">{dict.scannerPage.demoTitle}</h3>
        <p className="text-sm text-gray-700 mb-4">{dict.scannerPage.demoSubtitle}</p>
        <ul className="list-disc pl-5 text-sm font-mono bg-gray-50 p-4 rounded">
          <li>https://ekam-sanskriti.app/monument/taj-mahal</li>
          <li>https://ekam-sanskriti.app/monument/qutub-minar</li>
        </ul>
      </div>
    </div>
  );
}
