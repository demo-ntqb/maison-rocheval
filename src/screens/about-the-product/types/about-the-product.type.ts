/** Asset wiring for one caviar in the collection carousel. */
export interface CollectionCaviar {
  id: string;
  /** Base path (no extension) of the closed tin cut-out. */
  closedTin: string;
  /** Base path (no extension) of the open tin cut-out. */
  openTin: string;
  /** Base path (no extension) of the plated dish photograph. */
  dish: string;
}

/** Copy for one caviar, resolved on the server and handed to the client leaf. */
export interface CollectionCaviarContent extends CollectionCaviar {
  name: string;
  latinName: string;
  /** One-word flavour cue shown under the name on the carousel card. */
  note: string;
  tastingNotes: string;
  description: string;
  descriptionSecondary: string;
  atTable: string;
  tinAlt: string;
  dishAlt: string;
}

/** Labels shared by every panel of the collection carousel. */
export interface CollectionCarouselLabels {
  atTable: string;
  next: string;
  previous: string;
  selectorLabel: string;
}
