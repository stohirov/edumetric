import { api } from "./client";
import type {
  BehaviorRecordRequest,
  BulkBehaviorRequest,
} from "@/types/api";

export function recordBehavior(
  payload: BehaviorRecordRequest,
): Promise<number> {
  return api.post<number>("/behavior", payload);
}

export function bulkRecordBehavior(
  payload: BulkBehaviorRequest,
): Promise<number> {
  return api.post<number>("/behavior/bulk", payload);
}

export function recordActivity(
  payload: BehaviorRecordRequest,
): Promise<number> {
  return api.post<number>("/activity", payload);
}
