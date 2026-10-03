/* eslint-disable */
/**
 * Generated Convex server utilities stub for build & type checking without active cloud deployment
 */
import {
  actionGeneric,
  httpActionGeneric,
  queryGeneric,
  mutationGeneric,
  internalActionGeneric,
  internalMutationGeneric,
  internalQueryGeneric,
} from "convex/server";

export type Id<TableName extends string> = string & { __tableName: TableName };

export const query = queryGeneric;
export const mutation = mutationGeneric;
export const action = actionGeneric;
export const httpAction = httpActionGeneric;
export const internalQuery = internalQueryGeneric;
export const internalMutation = internalMutationGeneric;
export const internalAction = internalActionGeneric;
