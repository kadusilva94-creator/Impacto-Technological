// Recognition stays on this device. Only public model/runtime files are downloaded.
import { pipeline, env, RawImage } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js';
env.allowLocalModels = false;
env.backends.onnx.wasm.numThreads = 1;
env.backends.onnx.wasm.proxy = false;
let busy = false;
self.onmessage = async ({ data }) => {
  if (busy || data.type !== 'recognize') return;
  busy = true;
  let reader;
  try {
    reader = await pipeline('image-to-text', 'Xenova/trocr-small-handwritten', {
      quantized: true,
      revision: '02bea33ca09a70e2e2d91140a7e6e1a729606a5b',
      progress_callback: p => self.postMessage({ type: 'progress', id: data.id, status: p.status, file: p.file, progress: p.progress })
    });
    self.postMessage({ type: 'reading', id: data.id });
    const image = new RawImage(new Uint8ClampedArray(data.pixels), data.width, data.height, 4);
    const result = await reader(image, { max_new_tokens: 160, num_beams: 1 });
    self.postMessage({ type: 'result', id: data.id, text: result[0]?.generated_text || '' });
  } catch (error) {
    self.postMessage({ type: 'error', id: data.id, message: String(error?.message || error) });
  } finally {
    if (reader) try { await reader.dispose(); } catch (_) {}
    busy = false;
  }
};
