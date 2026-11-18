const DB_NAME = 'arbi_sikkhi_offline_audio_v1';
const STORE_NAME = 'tts_clips';

function openAudioDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getCachedAudio(key: string): Promise<string | null> {
  try {
    const db = await openAudioDB();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve((req.result as string) || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function setCachedAudio(key: string, base64Wav: string): Promise<void> {
  try {
    const db = await openAudioDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(base64Wav, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // Ignore storage quota errors gracefully
  }
}

let activeAudioElement: HTMLAudioElement | null = null;

export function stopActiveAudio(): void {
  if (activeAudioElement) {
    activeAudioElement.pause();
    activeAudioElement.currentTime = 0;
    activeAudioElement = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export async function playArabicAudio(
  arabicText: string,
  playbackRate = 1.0,
  options?: {loop?: boolean; onEnded?: () => void}
): Promise<{source: 'gemini-tts' | 'cached' | 'browser-fallback'; error?: string}> {
  stopActiveAudio();
  const clean = arabicText.trim();
  if (!clean) {
    options?.onEnded?.();
    return {source: 'cached'};
  }

  const cacheKey = `Kore::${clean}`;
  let base64Wav = await getCachedAudio(cacheKey);
  let source: 'gemini-tts' | 'cached' | 'browser-fallback' = 'cached';
  let apiError: string | undefined;

  if (!base64Wav) {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({text: clean, voice: 'Kore'}),
      });
      const data = (await response.json()) as {audioBase64?: string; error?: string};
      if (!response.ok || !data.audioBase64) {
        apiError = data.error || 'TTS service returned an error';
      } else {
        base64Wav = data.audioBase64;
        source = 'gemini-tts';
        await setCachedAudio(cacheKey, base64Wav);
      }
    } catch (err) {
      apiError = err instanceof Error ? err.message : 'Network offline';
    }
  }

  if (base64Wav) {
    const audio = new Audio(`data:audio/wav;base64,${base64Wav}`);
    audio.playbackRate = Math.max(0.5, Math.min(1.5, playbackRate));
    audio.preservesPitch = true;
    audio.loop = Boolean(options?.loop);
    activeAudioElement = audio;
    audio.onended = () => {
      if (activeAudioElement === audio) {
        activeAudioElement = null;
      }
      options?.onEnded?.();
    };
    audio.onerror = () => {
      options?.onEnded?.();
    };
    await audio.play();
    return {source};
  }

  // Offline / fallback Web Speech synthesis for Arabic if no cached WAV exists yet
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = 'ar-SA';
    utter.rate = Math.max(0.5, Math.min(1.3, playbackRate));
    utter.onend = () => options?.onEnded?.();
    utter.onerror = () => options?.onEnded?.();
    window.speechSynthesis.speak(utter);
    return {source: 'browser-fallback', error: apiError};
  }

  options?.onEnded?.();
  return {source: 'browser-fallback', error: apiError};
}

export async function prefetchOfflineAudioPack(items: string[], onProgress?: (done: number, total: number) => void): Promise<number> {
  let saved = 0;
  for (let i = 0; i < items.length; i++) {
    const text = items[i].trim();
    const key = `Kore::${text}`;
    const existing = await getCachedAudio(key);
    if (existing) {
      saved++;
      onProgress?.(i + 1, items.length);
      continue;
    }
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({text, voice: 'Kore'}),
      });
      if (res.ok) {
        const data = (await res.json()) as {audioBase64?: string};
        if (data.audioBase64) {
          await setCachedAudio(key, data.audioBase64);
          saved++;
        }
      }
    } catch {
      // Stop early if offline
      break;
    }
    onProgress?.(i + 1, items.length);
  }
  return saved;
}
