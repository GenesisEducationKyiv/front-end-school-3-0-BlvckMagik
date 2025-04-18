import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const trackApi = {
  getTracks: async (params: { page: number; limit: number }) => {
    return api.get("/tracks", { params });
  },
  createTrack: async (data: CreateTrackDto) => {
    return api.post("/tracks", data);
  },
  updateTrack: async (id: string, data: TrackFormData) => {
    return api.put(`/tracks/${id}`, data);
  },
  deleteTrack: async (id: string) => {
    return api.delete(`/tracks/${id}`);
  },
  uploadFile: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("audioFile", file);

    return api.post(`/tracks/${id}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      maxBodyLength: Infinity,
    });
  },
  getAudioFile: async (fileName: string) => {
    const response = await api.get(`/files/${fileName}`, {
      responseType: "blob",
    });
    return URL.createObjectURL(response.data);
  },
};
