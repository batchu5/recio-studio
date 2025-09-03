import axios from "axios";

const DB_NAME = "recordingDB";
const STORE_NAME = "chunks";
const DB_VERSION = 1;
let isUploading = 0;
const BackenUrl = import.meta.env.VITE_BACKEND_URL;
let count = 0;
let stopWorker = false;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      let store: IDBObjectStore;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });

      } else {
        store = req.transaction!.objectStore(STORE_NAME);
      }
      if (!Array.from(store.indexNames).includes("byUploaded")) {
        store.createIndex("byUploaded", "uploaded", { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveChunk(
  session_id: string,
  participant_id: string,
  blob: Blob,
  type: "screenShare" | "camera"
): Promise<number> {
    const db = await openDB();
    return new Promise<number>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.add({
        session_id,
        participant_id,
        blob,
        type,
        uploaded: 0
      });

      req.onsuccess = () => {
        resolve(req.result as number);
      };
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => {}; 
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
  });
}

async function getNextUnuploadedChunk(): Promise<any | null> {
  const db = await openDB();
  return new Promise<any | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const index = tx.objectStore(STORE_NAME).index("byUploaded");

    const req = index.openCursor(IDBKeyRange.only(0), "next");

    console.log("searching the queries");
    req.onsuccess = () => {
      const cursor = req.result;

      if(cursor){
        console.log("cursor exists");
        resolve(cursor.value);
      }else{
        console.log("no entries found in the frontend");
        resolve(null);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

async function markChunkAsUploaded(id: number): Promise<void> {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const chunk = getReq.result;
      if (!chunk) {
        resolve();
        return;
      }
      chunk.uploaded = 1; 
      const putReq = store.put(chunk);
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

async function uploadChunkToBackend(chunkData: any) {
    if(!chunkData){
        console.log("chunkData is empty while uploading the chunk to the backend");
        return;
    }
    const formData = new FormData();
    formData.append("blob", chunkData.blob, `chunk_${chunkData.id}.webm`); 
    formData.append("session_id", chunkData.session_id);
    formData.append("participant_id", chunkData.participant_id);
    formData.append("chunk_index", String(chunkData.id));
    formData.append("type", String(chunkData.type));

    console.log("sending the data to the backend");

    const res = await axios.post(`${BackenUrl}/api/upload_chunk`, formData  , {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;

}

export function checkStopWorker(){
  return stopWorker;
}

export async function startUploadWorker() {
  if (isUploading == 1) {
    console.log("isUploading is 1 bro")
    return;
  }

  isUploading = 1;

  while (true) {
    console.log("worker is running");
    const chunkData = await getNextUnuploadedChunk();
    console.log("after reolveing the cursor", chunkData);

    if (!chunkData && count <= 5) {
      count++;
      console.log("count where count < 3", count);
      console.log("No chunk found, checking again in 1s...");
      await new Promise((r) => setTimeout(r, 1000));
      continue;
    }

    if(!chunkData && count >= 6){
        console.log("count where count > 3", count);
        console.log("obviously you have stopped the recordin");
        stopWorker = true;
        break;
    }

    try {
      count = 0;
      console.log("Uploading chunk", chunkData.id);

      if(!chunkData.id){continue}
      await uploadChunkToBackend(chunkData); 
      await markChunkAsUploaded(chunkData.id);
      console.log(`Uploaded chunk ${chunkData.id}`);
    } catch (err) {
      console.error(` Upload failed for chunk , retrying in 5s...`, err);
      await new Promise((r) => setTimeout(r, 5000));
    }

    await new Promise((r) => setTimeout(r, 1000));
  }
}
