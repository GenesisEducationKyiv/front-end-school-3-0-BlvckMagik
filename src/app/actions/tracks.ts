"use server";

import { revalidatePath } from "next/cache";
import { trackApi } from "@/lib/api";
import { TrackFormData } from "@/types";

export async function getTracks(page: number = 1, limit: number = 10) {
  const response = await trackApi.getTracks({ page, limit });
  return {
    data: response.data.data,
    meta: response.data.meta,
  };
}

export async function createTrack(data: TrackFormData) {
  const response = await trackApi.createTrack(data);
  revalidatePath("/tracks");
  return response.data;
}

export async function updateTrack(id: string, data: TrackFormData) {
  const response = await trackApi.updateTrack(id, data);
  revalidatePath("/tracks");
  return response.data;
}

export async function deleteTrack(id: string) {
  await trackApi.deleteTrack(id);
  revalidatePath("/tracks");
}

export async function uploadTrackFile(trackId: string, file: File) {
  const response = await trackApi.uploadFile(trackId, file);
  return response.data;
}
