import { React, useState } from "react";
import { Row, Col, Checkbox, Input, Button, Tag, Typography } from "antd";

const { Text } = Typography;

const LEGEND_ITEMS = [
  {
    group: "Disease",
    items: [
      { shape: "triangle", color: "red", label: "Refractive Errors", class: "Refractive Errors" },
      { shape: "triangle", color: "blue", label: "Retinal Diseases", class: "Retinal Diseases" },
      { shape: "triangle", color: "green", label: "Others", class: "Others" },
      { shape: "triangle", color: "orange", label: "Lens Diseases", class: "Lens Diseases" },
      { shape: "triangle", color: "purple", label: "Ocular Hypertension", class: "Ocular Hypertension" },
      { shape: "triangle", color: "pink", label: "Ocular Motility Disorders", class: "Ocular Motility Disorders" },
      { shape: "triangle", color: "cyan", label: "Uveal Diseases", class: "Uveal Diseases" },
      { shape: "triangle", color: "magenta", label: "Corneal Diseases", class: "Corneal Diseases" },
      { shape: "triangle", color: "lime", label: "Conjunctival Diseases", class: "Conjunctival Diseases" },
      { shape: "triangle", color: "teal", label: "Orbital Diseases", class: "Orbital Diseases" },
      { shape: "triangle", color: "salmon", label: "Eye Neoplasms", class: "Eye Neoplasms" },
      { shape: "triangle", color: "violet", label: "Lacrimal Apparatus Diseases", class: "Lacrimal Apparatus Diseases" },
    ],
  },
  {
    group: "Gene",
    items: [
      { shape: "circle", color: "brown", label: "Pseudogene", class: "Pseudogene" },
      { shape: "circle", color: "darkgreen", label: "Genetic Locus", class: "Genetic Locus" },
      { shape: "circle", color: "orange", label: "lncRNA", class: "lncRNA" },
      { shape: "circle", color: "purple", label: "miRNA", class: "miRNA" },
      { shape: "circle", color: "darkblue", label: "mt_tRNA", class: "mt_tRNA" },
      { shape: "circle", color: "gray", label: "Other", class: "Other" },
      { shape: "circle", color: "yellow", label: "Protein coding", class: "Protein coding" },
      { shape: "circle", color: "pink", label: "RNA gene", class: "RNA gene" },
    ],
  },
  {
    group: "Drug",
    items: [
      { shape: "square", color: "#FF6B6B", label: "Phase 0", class: "0" },
      { shape: "square", color: "#4ECDC4", label: "Phase 1", class: "1" },
      { shape: "square", color: "#45B7D1", label: "Phase 2", class: "2" },
      { shape: "square", color: "#96CEB4", label: "Phase 3", class: "3" },
      { shape: "square", color: "#FFEAA7", label: "Phase 4", class: "4" },
      { shape: "square", color: "#DDA0DD", label: "Phase 5", class: "5" },
    ],
  },
];

const GROUP_COLORS = {
  Disease: "#e6f4ff",
  Gene: "#f6ffed",
  Drug: "#fff7e6",
};

const Legend = ({
  checkedClasses,
  expandedState,
  availableClasses = {},
  availableIds = {},
  onClassChange,
  setExpandedState,
}) => {
  const [expandedClasses, setExpandedClasses] = useState({});
  const [searchQueries, setSearchQueries] = useState({});

  const getExpandedEntriesForItem = (item) => {
    const query = searchQueries[item.class] || "";

    return Object.entries(expandedState)
      .filter(([id, details]) => {
        if (String(details.label).toLowerCase() !== String(item.class).toLowerCase()) {
          return false;
        }
        return id.toLowerCase().includes(query);
      })
      .sort(([idA], [idB]) => idA.localeCompare(idB));
  };

  const handleMainCategoryChange = (className, checked) => {
    if (!availableClasses[className]) return;
    onClassChange?.(className, checked);

    setExpandedState?.((prev) => {
      const updated = { ...prev };
      Object.entries(updated).forEach(([id, details]) => {
        if (String(details.label).toLowerCase() !== String(className).toLowerCase()) {
          return;
        }
        if (!availableIds[id]) {
          return;
        }
        updated[id] = { ...details, visible: checked };
      });
      return updated;
    });
  };

  const toggleExpand = (className) => {
    setExpandedClasses((prev) => ({
      ...prev,
      [className]: !prev[className],
    }));
  };

  const renderShape = (item) => {
    if (item.shape === "triangle") {
      return (
        <svg width="18" height="18">
          <polygon points="9,0 0,18 18,18" fill={item.color} />
        </svg>
      );
    }
    if (item.shape === "circle") {
      return (
        <svg width="18" height="18">
          <circle cx="9" cy="9" r="9" fill={item.color} />
        </svg>
      );
    }
    return (
      <div
        style={{
          width: "28px",
          height: "14px",
          backgroundColor: item.color,
          borderRadius: "9999px",
        }}
      />
    );
  };

  return (
    <Row
      style={{
        maxHeight: "calc(100vh - 120px)",
        overflowY: "auto",
        scrollbarWidth: "thin",
        scrollbarColor: "#888 #f1f1f1",
      }}
    >
      <Col span={24} style={{ marginBottom: "12px" }}>
        <Text type="secondary" style={{ fontSize: "12px" }}>
          Items not in the current graph are disabled. Available items can be checked or unchecked, then click Filter Data.
        </Text>
      </Col>

      {LEGEND_ITEMS.map((group, groupIndex) => (
        <Col key={groupIndex} span={24} style={{ marginBottom: "14px" }}>
          <div
            style={{
              background: GROUP_COLORS[group.group] || "#fafafa",
              borderRadius: "8px",
              border: "1px solid #f0f0f0",
              padding: "12px",
            }}
          >
            <div
              style={{
                marginBottom: "10px",
                paddingBottom: "8px",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <Text strong style={{ fontSize: "14px" }}>
                {group.group}
              </Text>
            </div>

            {group.items.map((item, index) => {
              const expandedEntries = getExpandedEntriesForItem(item);
              const categoryAvailable = !!availableClasses[item.class];
              const checkedCount = expandedEntries.filter(
                ([id, details]) => details.visible && availableIds[id]
              ).length;

              return (
                <div
                  key={index}
                  style={{
                    marginBottom: index === group.items.length - 1 ? 0 : "10px",
                    background: "#fff",
                    borderRadius: "6px",
                    padding: "8px",
                    border: "1px solid #f0f0f0",
                    opacity: categoryAvailable ? 1 : 0.55,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      style={{
                        cursor: "pointer",
                        fontSize: "11px",
                        color: "#8c8c8c",
                        width: "14px",
                      }}
                      onClick={() => toggleExpand(item.class)}
                    >
                      {expandedClasses[item.class] ? "▼" : "▶"}
                    </div>

                    {renderShape(item)}

                    <Checkbox
                      checked={!!checkedClasses[item.class]}
                      disabled={!categoryAvailable}
                      onChange={(e) => handleMainCategoryChange(item.class, e.target.checked)}
                    />

                    <Text style={{ fontSize: "13px", flex: 1 }}>{item.label}</Text>

                    <Tag style={{ margin: 0, fontSize: "11px" }}>
                      {checkedCount}/{expandedEntries.length}
                    </Tag>
                  </div>

                  {expandedClasses[item.class] && (
                    <div style={{ marginTop: "10px", marginLeft: "30px" }}>
                      <Input
                        placeholder="Search..."
                        size="small"
                        value={searchQueries[item.class] || ""}
                        onChange={(e) =>
                          setSearchQueries((prev) => ({
                            ...prev,
                            [item.class]: e.target.value.toLowerCase(),
                          }))
                        }
                        style={{ marginBottom: "8px" }}
                        allowClear
                      />

                      {categoryAvailable && (
                        <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                          <Button
                            size="small"
                            type="primary"
                            onClick={() => {
                              setExpandedState?.((prev) => {
                                const updated = { ...prev };
                                getExpandedEntriesForItem(item).forEach(([id]) => {
                                  if (availableIds[id]) {
                                    updated[id] = { ...updated[id], visible: true };
                                  }
                                });
                                return updated;
                              });
                              onClassChange?.(item.class, true);
                            }}
                          >
                            Select All
                          </Button>
                          <Button
                            size="small"
                            danger
                            onClick={() => {
                              setExpandedState?.((prev) => {
                                const updated = { ...prev };
                                getExpandedEntriesForItem(item).forEach(([id]) => {
                                  if (availableIds[id]) {
                                    updated[id] = { ...updated[id], visible: false };
                                  }
                                });
                                return updated;
                              });
                              onClassChange?.(item.class, false);
                            }}
                          >
                            Unselect All
                          </Button>
                        </div>
                      )}

                      <ul
                        style={{
                          maxHeight: "220px",
                          overflowY: "auto",
                          border: "1px solid #e8e8e8",
                          borderRadius: "6px",
                          padding: "6px 10px",
                          listStyle: "none",
                          margin: 0,
                          background: "#fafafa",
                        }}
                      >
                        {expandedEntries.length === 0 ? (
                          <li>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              No items
                            </Text>
                          </li>
                        ) : (
                          expandedEntries.map(([id, details]) => {
                            const itemAvailable = !!availableIds[id];
                            return (
                              <li
                                key={id}
                                style={{
                                  padding: "5px 0",
                                  borderBottom: "1px solid #f0f0f0",
                                }}
                              >
                                <Checkbox
                                  checked={!!details.visible}
                                  disabled={!itemAvailable}
                                  onChange={(e) =>
                                    setExpandedState?.((prev) => ({
                                      ...prev,
                                      [id]: { ...prev[id], visible: e.target.checked },
                                    }))
                                  }
                                >
                                  <Text style={{ fontSize: "12px" }}>{id}</Text>
                                </Checkbox>
                              </li>
                            );
                          })
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Col>
      ))}
    </Row>
  );
};

export default Legend;
