export interface Selection {
  ids: ReadonlySet<string>;
  /** The last clicked id, used as the start of a shift+click range. */
  anchorId: string | null;
}

export const EMPTY_SELECTION: Selection = { ids: new Set(), anchorId: null };

export function toggleSelected(selection: Selection, id: string): Selection {
  const ids = new Set(selection.ids);
  if (ids.has(id)) ids.delete(id);
  else ids.add(id);
  return { ids, anchorId: id };
}

/**
 * Selects everything between the anchor and `id` in `orderedIds` (both ends included).
 * Falls back to a plain toggle when there is no anchor or it is not in `orderedIds`.
 */
export function selectRange(selection: Selection, id: string, orderedIds: string[]): Selection {
  const anchorIndex = selection.anchorId === null ? -1 : orderedIds.indexOf(selection.anchorId);
  const targetIndex = orderedIds.indexOf(id);
  if (anchorIndex === -1 || targetIndex === -1) return toggleSelected(selection, id);

  const [start, end] =
    anchorIndex < targetIndex ? [anchorIndex, targetIndex] : [targetIndex, anchorIndex];
  const ids = new Set(selection.ids);
  for (const rangeId of orderedIds.slice(start, end + 1)) ids.add(rangeId);
  return { ids, anchorId: id };
}

export function selectAll(selection: Selection, ids: string[]): Selection {
  return { ...selection, ids: new Set([...selection.ids, ...ids]) };
}

/** Drops ids that no longer exist. Returns the same object when nothing changed. */
export function pruneSelection(selection: Selection, existingIds: ReadonlySet<string>): Selection {
  const ids = new Set([...selection.ids].filter((id) => existingIds.has(id)));
  if (ids.size === selection.ids.size) return selection;

  const anchorId =
    selection.anchorId !== null && existingIds.has(selection.anchorId) ? selection.anchorId : null;
  return { ids, anchorId };
}
