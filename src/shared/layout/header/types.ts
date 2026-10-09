export type NavCategory = {
  id: string;
  name: string;
  slug: string;
  /** Optional image URL — may be empty/undefined; UI must not crash. */
  image?: string | null;
};
