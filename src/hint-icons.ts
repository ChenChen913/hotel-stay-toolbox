import type { Component } from 'vue';
import { Baby, Briefcase, Camera, PawPrint, Pill, Shirt } from 'lucide-vue-next';

export const HINT_ICON_MAP: Record<string, Component> = {
  briefcase: Briefcase,
  camera: Camera,
  pill: Pill,
  baby: Baby,
  shirt: Shirt,
  'paw-print': PawPrint,
};
