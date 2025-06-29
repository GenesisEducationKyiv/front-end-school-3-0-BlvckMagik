"use client";

import dynamic from "next/dynamic";
import { type ComponentType } from "react";
import { type Track } from "@/lib/validators";

const CreateTrackModal = dynamic(() => import("./CreateTrackModal"), {
  ssr: false,
});

const EditTrackModal = dynamic(() => import("./EditTrackModal"), {
  ssr: false,
});

const TrackDetailsModal = dynamic(() => import("./TrackDetailsModal"), {
  ssr: false,
});

interface CreateTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EditTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track;
}

interface TrackDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track;
}

export const LazyCreateTrackModal: ComponentType<CreateTrackModalProps> = CreateTrackModal;
export const LazyEditTrackModal: ComponentType<EditTrackModalProps> = EditTrackModal;
export const LazyTrackDetailsModal: ComponentType<TrackDetailsModalProps> = TrackDetailsModal; 