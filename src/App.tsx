import { useEffect, useRef, useState } from "react";

type SpeakerTone = "violet" | "blue" | "green" | "teal" | "magenta" | "rose" | "orange";

type SpeakerChip = {
  id: string;
  label: string;
  tone: SpeakerTone;
  avatar: string;
  width?: number;
};

type SpeakerRow = {
  id: string;
  chips: SpeakerChip[];
};

const tabs = [
  { id: "episode", label: "当前剧集", active: false },
  { id: "all", label: "全剧", active: true }
];

const initialSpeakerRows: SpeakerRow[] = [
  {
    id: "linran",
    chips: [
      {
        id: "linran",
        label: "林然",
        tone: "violet",
        avatar: "/assets/menu/default-speakers/linran.png",
        width: 66
      }
    ]
  },
  {
    id: "xiaoxia",
    chips: [
      {
        id: "xiaoxia",
        label: "小夏",
        tone: "blue",
        avatar: "/assets/menu/default-speakers/xiaoxia.png",
        width: 66
      }
    ]
  },
  {
    id: "guyan",
    chips: [
      {
        id: "guyan",
        label: "顾言",
        tone: "green",
        avatar: "/assets/menu/default-speakers/guyan.png",
        width: 66
      }
    ]
  },
  {
    id: "suwan",
    chips: [
      {
        id: "suwan",
        label: "苏晚",
        tone: "teal",
        avatar: "/assets/menu/default-speakers/suwan.png",
        width: 66
      }
    ]
  },
  {
    id: "zhounian",
    chips: [
      {
        id: "zhounian",
        label: "周念",
        tone: "magenta",
        avatar: "/assets/menu/default-speakers/zhounian.png",
        width: 66
      }
    ]
  },
  {
    id: "yinghong",
    chips: [
      {
        id: "yinghong",
        label: "颖宏",
        tone: "rose",
        avatar: "/assets/menu/default-speakers/yinghong.png",
        width: 66
      }
    ]
  },
  {
    id: "liudapeng",
    chips: [
      {
        id: "liudapeng",
        label: "刘大鹏",
        tone: "orange",
        avatar: "/assets/menu/default-speakers/guyan.png",
        width: 68
      }
    ]
  }
];

const menuActions = [
  { id: "rename", label: "重命名" },
  { id: "merge", label: "合并说话人" }
];

function buildMergedLabel(row: SpeakerRow) {
  if (row.chips.length === 1) {
    return row.chips[0].label;
  }

  return `${row.chips[0].label} +${row.chips.length - 1}`;
}

function SpeakerTag({
  chip,
  label,
  merged,
  muted
}: {
  chip: SpeakerChip;
  label?: string;
  merged?: boolean;
  muted?: boolean;
}) {
  return (
    <span
      className={`speaker-tag speaker-tag--${chip.tone}${merged ? " speaker-tag--merged" : ""}`}
      style={!merged && chip.width ? { width: `${chip.width}px` } : undefined}
    >
      <span className="speaker-tag__avatar">
        <img
          src={chip.avatar}
          alt=""
          className="speaker-tag__image"
        />
      </span>
      <span
        className={`speaker-tag__label${merged ? " speaker-tag__label--merged" : ""}${
          muted ? " speaker-tag__label--muted" : ""
        }`}
      >
        {label ?? chip.label}
      </span>
    </span>
  );
}

export default function App() {
  const [speakerRows, setSpeakerRows] = useState(initialSpeakerRows);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState<string | null>(null);
  const [mergeCandidateIds, setMergeCandidateIds] = useState<string[]>([]);
  const [draggedRowId, setDraggedRowId] = useState<string | null>(null);
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null);
  const [initialDropzoneActive, setInitialDropzoneActive] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const menuSurfaceRef = useRef<HTMLDivElement | null>(null);
  const moreButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const mergeCandidateRows = mergeCandidateIds
    .map((candidateId) => speakerRows.find((row) => row.id === candidateId) ?? null)
    .filter((row): row is SpeakerRow => row !== null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuSurfaceRef.current?.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!openMenuId) {
      setMenuPosition(null);
      return;
    }

    const updateMenuPosition = () => {
      const surface = menuSurfaceRef.current;
      const trigger = moreButtonRefs.current[openMenuId];

      if (!surface || !trigger) {
        return;
      }

      const surfaceRect = surface.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();

      setMenuPosition({
        left: triggerRect.right - surfaceRect.left + 12,
        top: triggerRect.top - surfaceRect.top - 24
      });
    };

    updateMenuPosition();

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [openMenuId]);

  const handleSelect = (id: string) => {
    setSelectedId((currentId) => (currentId === id ? null : id));
    setOpenMenuId(null);
  };

  const handleActionClick = (actionId: string, rowId: string) => {
    if (actionId === "merge") {
      setMergeTargetId(rowId);
      setMergeCandidateIds([]);
      setDropIndicatorIndex(null);
      setInitialDropzoneActive(false);
      setSelectedId((currentId) => (currentId === rowId ? null : currentId));
    }

    setOpenMenuId(null);
  };

  const insertMergeCandidateAt = (index: number) => {
    if (!draggedRowId || !mergeTargetId || draggedRowId === mergeTargetId) {
      return;
    }

    setMergeCandidateIds((currentIds) => {
      const nextIds = currentIds.filter((id) => id !== draggedRowId);
      const boundedIndex = Math.max(0, Math.min(index, nextIds.length));
      nextIds.splice(boundedIndex, 0, draggedRowId);
      return nextIds;
    });

    setHoveredId(null);
    setOpenMenuId(null);
    setDropIndicatorIndex(null);
    setDraggedRowId(null);
    setInitialDropzoneActive(false);
  };

  const handleMerge = () => {
    if (!mergeTargetId || mergeCandidateIds.length === 0) {
      return;
    }

    setSpeakerRows((rows) => {
      const sourceRows = mergeCandidateIds
        .map((candidateId) => rows.find((row) => row.id === candidateId) ?? null)
        .filter((row): row is SpeakerRow => row !== null);

      return rows
        .map((row) =>
          row.id === mergeTargetId
            ? {
                ...row,
                chips: [...row.chips, ...sourceRows.flatMap((sourceRow) => sourceRow.chips)]
              }
            : row
        )
        .filter((row) => !mergeCandidateIds.includes(row.id));
    });

    setSelectedId((currentId) => (currentId && mergeCandidateIds.includes(currentId) ? mergeTargetId : currentId));
    setHoveredId(mergeTargetId);
    setMergeTargetId(null);
    setMergeCandidateIds([]);
    setDraggedRowId(null);
    setDropIndicatorIndex(null);
    setInitialDropzoneActive(false);
  };

  const visibleRows = speakerRows.filter((row) => !mergeCandidateIds.includes(row.id));

  return (
    <main className="menu-demo-shell">
      <div
        ref={menuSurfaceRef}
        className="speaker-menu-surface"
      >
        <section className="speaker-menu" aria-label="切换说话人">
          <header className="speaker-menu__tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`speaker-tab${tab.active ? " speaker-tab--active" : ""}`}
                aria-pressed={tab.active}
              >
                {tab.label}
              </button>
            ))}
          </header>

          <div className="speaker-menu__list">
            {visibleRows.map((row) => {
              const primaryChip = row.chips[0];
              const isHovered = hoveredId === row.id || openMenuId === row.id;
              const isMergeTarget = mergeTargetId === row.id;
              const canShowMenu = !isMergeTarget && (isHovered || openMenuId === row.id);
              const mergedLabel = buildMergedLabel(row);

              if (isMergeTarget) {
                return (
                  <div key={row.id} className="speaker-merge-card">
                    <div className="speaker-merge-card__head">
                      <div className="speaker-merge-card__main">
                        <span className="speaker-row__check" aria-hidden="true">
                          <img src="/assets/menu/icon-check.svg" alt="" />
                        </span>
                        <SpeakerTag chip={primaryChip} />
                      </div>
                    </div>

                    <div className="speaker-merge-card__hint">
                      <span className="speaker-merge-card__hint-text">拖动要合并的说话人到这里</span>
                    </div>

                    {mergeCandidateRows.length > 0 ? (
                      <div
                        className="speaker-merge-card__candidates"
                        onDragOver={(event) => {
                          if (!draggedRowId || draggedRowId === mergeTargetId) {
                            return;
                          }

                          event.preventDefault();
                          event.dataTransfer.dropEffect = "move";

                          const candidateRows = Array.from(
                            event.currentTarget.querySelectorAll('[data-merge-candidate-row="true"]')
                          ) as HTMLDivElement[];

                          const nextIndex = candidateRows.findIndex(
                            (rowElement) => event.clientY < rowElement.getBoundingClientRect().top + 22
                          );

                          setDropIndicatorIndex(nextIndex === -1 ? mergeCandidateRows.length : nextIndex);
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          insertMergeCandidateAt(dropIndicatorIndex ?? mergeCandidateRows.length);
                        }}
                      >
                        {mergeCandidateRows.map((candidateRow, index) => (
                          <div key={candidateRow.id}>
                            {dropIndicatorIndex === index ? (
                              <div className="speaker-merge-card__indicator" aria-hidden="true" />
                            ) : null}

                            <div className="speaker-merge-card__candidate-row" data-merge-candidate-row="true">
                              <div className="speaker-merge-card__main">
                                <span className="speaker-row__check" aria-hidden="true">
                                  <img src="/assets/menu/icon-check.svg" alt="" />
                                </span>
                                <SpeakerTag chip={candidateRow.chips[0]} muted />
                              </div>
                            </div>
                          </div>
                        ))}

                        {dropIndicatorIndex === mergeCandidateRows.length ? (
                          <div className="speaker-merge-card__indicator" aria-hidden="true" />
                        ) : null}
                      </div>
                    ) : null}

                    <div
                      className={`speaker-merge-card__action${
                        mergeCandidateRows.length === 0 ? " speaker-merge-card__action--dropzone" : ""
                      }`}
                      onDragEnter={(event) => {
                        if (mergeCandidateRows.length > 0 || !draggedRowId || draggedRowId === mergeTargetId) {
                          return;
                        }

                        event.preventDefault();
                        setInitialDropzoneActive(true);
                      }}
                      onDragOver={(event) => {
                        if (mergeCandidateRows.length > 0 || !draggedRowId || draggedRowId === mergeTargetId) {
                          return;
                        }

                        event.preventDefault();
                        event.dataTransfer.dropEffect = "move";
                        setInitialDropzoneActive(true);
                      }}
                      onDragLeave={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                          setInitialDropzoneActive(false);
                        }
                      }}
                      onDrop={(event) => {
                        if (mergeCandidateRows.length > 0) {
                          return;
                        }

                        event.preventDefault();
                        setInitialDropzoneActive(false);
                        insertMergeCandidateAt(0);
                      }}
                    >
                      {mergeCandidateRows.length === 0 ? (
                        <div
                          className={`speaker-merge-card__dropbox${
                            initialDropzoneActive ? " speaker-merge-card__dropbox--active" : ""
                          }`}
                          aria-hidden="true"
                        >
                          <span className="speaker-merge-card__dropbox-plus">+</span>
                        </div>
                      ) : (
                        <button type="button" className="speaker-merge-card__button" onClick={handleMerge}>
                          合并
                        </button>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={row.id}
                  className={`speaker-row${isHovered ? " speaker-row--hovered" : ""}${
                    draggedRowId === row.id ? " speaker-row--dragging" : ""
                  }`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedId === row.id}
                  draggable={mergeTargetId !== null && row.id !== mergeTargetId}
                  onClick={() => handleSelect(row.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleSelect(row.id);
                    }
                  }}
                  onMouseEnter={() => setHoveredId(row.id)}
                  onMouseLeave={() => setHoveredId((currentId) => (currentId === row.id ? null : currentId))}
                  onFocus={() => setHoveredId(row.id)}
                  onBlur={() => setHoveredId((currentId) => (currentId === row.id ? null : currentId))}
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", row.id);
                    setDraggedRowId(row.id);
                    setOpenMenuId(null);
                  }}
                  onDragEnd={() => {
                    setDraggedRowId(null);
                    setDropIndicatorIndex(null);
                    setInitialDropzoneActive(false);
                  }}
                >
                  <div className="speaker-row__main">
                    <span
                      className={`speaker-row__check${selectedId === row.id ? " speaker-row__check--visible" : ""}`}
                      aria-hidden={selectedId !== row.id}
                    >
                      <img src="/assets/menu/icon-check.svg" alt="" />
                    </span>

                    {row.chips.length > 1 ? (
                      <SpeakerTag chip={primaryChip} label={mergedLabel} merged />
                    ) : (
                      <SpeakerTag chip={primaryChip} />
                    )}
                  </div>

                  {canShowMenu ? (
                    <button
                      ref={(node) => {
                        moreButtonRefs.current[row.id] = node;
                      }}
                      type="button"
                      className="speaker-row__more"
                      aria-label={`${mergedLabel} 更多操作`}
                      aria-expanded={openMenuId === row.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenMenuId((currentId) => (currentId === row.id ? null : row.id));
                      }}
                    >
                      <img src="/assets/menu/icon-more.svg" alt="" />
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>

          <button type="button" className="speaker-menu__add">
            <span className="speaker-menu__add-icon" aria-hidden="true">
              <img src="/assets/menu/icon-plus.svg" alt="" />
            </span>
            <span>新增说话人标签</span>
          </button>
        </section>

        {openMenuId && menuPosition ? (
          <div
            className="speaker-context-menu"
            style={{
              left: `${menuPosition.left}px`,
              top: `${menuPosition.top}px`
            }}
            role="menu"
            aria-label="说话人操作菜单"
          >
            {menuActions.map((action) => (
              <button
                key={action.id}
                type="button"
                className="speaker-context-menu__item"
                role="menuitem"
                onClick={() => handleActionClick(action.id, openMenuId)}
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
