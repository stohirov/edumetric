import { api } from "./client";
import type { LibraryItemDto } from "@/types/api";

export function listLibrary(): Promise<LibraryItemDto[]> {
  return api.get<LibraryItemDto[]>("/library");
}
