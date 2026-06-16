import { api } from "./client";
import type { LibraryItemDto, PageResponse } from "@/types/api";

export function listLibrary(): Promise<LibraryItemDto[]> {
  return api
    .get<PageResponse<LibraryItemDto>>("/library", { query: { size: 200 } })
    .then((p) => p.items);
}
