import type {
  CollectionGroup,
  CollectionReference,
  DocumentSnapshot,
  Query,
  Transaction,
} from "firebase-admin/firestore";
import {
  makeMutableDocument,
  makeMutableDocumentInTransaction,
} from "~/documents";
import type { FsData, FsMutableDocument } from "~/types";
import type { SelectedDocument } from "./types";

export async function getFirstDocument<
  T extends FsData,
  K extends keyof T = keyof T,
  S extends K[] | undefined = undefined,
>(
  ref: CollectionReference<T>,
  queryFn: (collection: CollectionReference) => Query,
  options: { select?: S } = {}
): Promise<FsMutableDocument<SelectedDocument<T, K, S>, T> | undefined> {
  const finalQuery = options.select
    ? queryFn(ref).select(...(options.select as string[]))
    : queryFn(ref);

  const snapshot = await finalQuery.limit(1).get();

  if (snapshot.empty) {
    return;
  }

  return makeMutableDocument<SelectedDocument<T, K, S>, T>(
    snapshot.docs[0] as DocumentSnapshot<SelectedDocument<T, K, S>>
  );
}

export async function getFirstDocumentInTransaction<
  T extends FsData,
  K extends keyof T = keyof T,
  S extends K[] | undefined = undefined,
>(
  tx: Transaction,
  ref: CollectionReference<T> | CollectionGroup<T>,
  queryFn: (collection: CollectionReference | CollectionGroup) => Query,
  options: { select?: S } = {}
) {
  const finalQuery = options.select
    ? queryFn(ref).select(...(options.select as string[]))
    : queryFn(ref);

  const snapshot = await tx.get(finalQuery.limit(1));

  if (snapshot.empty) {
    return;
  }

  return makeMutableDocumentInTransaction<SelectedDocument<T, K, S>, T>(
    snapshot.docs[0] as DocumentSnapshot<SelectedDocument<T, K, S>>,
    tx
  );
}
