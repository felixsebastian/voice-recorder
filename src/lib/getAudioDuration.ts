export const getAudioDuration = (blob: Blob | null) => {
  if (blob === null) return 0;

  return new Promise<number>((resolve, reject) => {
    const audio = new Audio();
    audio.src = URL.createObjectURL(blob);

    audio.onloadedmetadata =  () => {
      if (audio.duration === Infinity) {
        audio.currentTime = 1e101;

        audio.ontimeupdate = () => {
          audio.ontimeupdate = null;
          resolve(audio.duration);
          URL.revokeObjectURL(audio.src);
        };
      } else {
        resolve(audio.duration);
        URL.revokeObjectURL(audio.src);
      }
    };

    audio.onerror = () => reject(new Error("Error loading audio"));
  });
};
