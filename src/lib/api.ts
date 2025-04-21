import axios from "axios";
import { CreateTrackDto, TrackFormData } from "@/types";

export const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const trackApi = {
  getTracks: async (params: { page: number; limit: number; id?: string }) => {
    return api.get("/tracks", { params });
  },
  createTrack: async (data: CreateTrackDto) => {
    return api.post("/tracks", data);
  },
  updateTrack: async (id: string, data: TrackFormData) => {
    return api.put(`/tracks/${id}`, data);
  },
  deleteTrack: async (id: string) => {
    await api.delete(`/tracks/${id}/file`);
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
  getGenres: async () => {
    return api.get("/genres");
  },
};
