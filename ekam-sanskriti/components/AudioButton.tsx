'use client';
import { useState } from 'react';
import { Volume2, Square } from 'lucide-react';

export default function AudioButton({ text, lang }: { text: string; lang: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleAudio = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  return (
    <button onClick={toggleAudio} className="p-2 bg-saffron-100 rounded-full hover:bg-saffron-200">
      {isPlaying ? <Square size={16} /> : <Volume2 size={16} />}
    </button>
  );
}
