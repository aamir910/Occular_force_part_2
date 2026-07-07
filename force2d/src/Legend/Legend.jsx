import { React, useState, useEffect, useMemo } from "react";
import { Row, Col, Checkbox, Input, Button, Tag, Typography, Empty } from "antd";
import ToggleCategory from "./ToggleCategory";

const { Text } = Typography;

const LEGEND_ITEMS = [
  {
    group: "Disease",
    items: [
      { shape: "triangle", color: "red", label: "Refractive errors", class: "Refractive errors" },
      { shape: "triangle", color: "blue", label: "Retinal diseases", class: "Retinal diseases" },
      { shape: "triangle", color: "green", label: "Others", class: "Others" },
      { shape: "triangle", color: "orange", label: "Lens diseases", class: "Lens diseases" },
      { shape: "triangle", color: "purple", label: "Ocular hypertension", class: "Ocular hypertension" },
      { shape: "triangle", color: "pink", label: "Ocular motility disorders", class: "Ocular motility disorders" },
      { shape: "triangle", color: "cyan", label: "Uveal diseases", class: "Uveal diseases" },
      { shape: "triangle", color: "magenta", label: "Corneal diseases", class: "Corneal diseases" },
      { shape: "triangle", color: "lime", label: "Conjunctival diseases", class: "Conjunctival diseases" },
      { shape: "triangle", color: "teal", label: "Orbital diseases", class: "Orbital diseases" },
      { shape: "triangle", color: "salmon", label: "Eye Neoplasms", class: "Eye Neoplasms" },
      { shape: "triangle", color: "violet", label: "Lacrimal Apparatus diseases", class: "Lacrimal Apparatus diseases" },
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
  onClassChange,
  setCheckedClasses,
  expandedState,
  setExpandedState,
  selectedDiseases = [],
}) => {
  const [expandedClasses, setExpandedClasses] = useState({});
  const [searchQueries, setSearchQueries] = useState({});
  const [indeterminateState, setIndeterminateState] = useState({});

  const filteredLegendItems = useMemo(() => {
    if (selectedDiseases.length === 0) {
      return [];
    }

    return LEGEND_ITEMS.map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        Object.values(expandedState).some(
          (details) => String(details.label) === String(item.class)
        )
      ),
    })).filter((group) => group.items.length > 0);
  }, [expandedState, selectedDiseases]);

  const getExpandedEntriesForItem = (item) => {
    const query = searchQueries[item.class] || "";

    return Object.entries(expandedState)
      .filter(([id, details]) => {
        if (String(details.label) !== String(item.class)) {
          return false;
        }
        if (details.type === "Disease" && !selectedDiseases.includes(id)) {
          return false;
        }
        return id.toLowerCase().includes(query);
      })
      .sort(([idA], [idB]) => idA.localeCompare(idB));
  };

  useEffect(() => {
    if (!expandedState || !checkedClasses || filteredLegendItems.length === 0) return;

    const updatedCheckedClasses = { ...checkedClasses };
    const updatedIndeterminateState = {};

    filteredLegendItems.forEach((group) => {
      group.items.forEach((item) => {
        const relatedExpandedItems = Object.entries(expandedState).filter(
          ([id, details]) => {
            if (String(details.label) !== String(item.class)) {
              return false;
            }
            if (details.type === "Disease") {
              return selectedDiseases.includes(id);
            }
            return true;
          }
        );

        if (relatedExpandedItems.length > 0) {
          const allExpandedChecked = relatedExpandedItems.every(
            ([_, details]) => details.visible
          );
          const anyExpandedChecked = relatedExpandedItems.some(
            ([_, details]) => details.visible
          );

          if (allExpandedChecked) {
            updatedCheckedClasses[item.class] = true;
            updatedIndeterminateState[item.class] = false;
          } else if (anyExpandedChecked) {
            updatedCheckedClasses[item.class] = true;
            updatedIndeterminateState[item.class] = true;
          } else {
            updatedCheckedClasses[item.class] = false;
            updatedIndeterminateState[item.class] = false;
          }
        }
      });
    });

    if (JSON.stringify(updatedCheckedClasses) !== JSON.stringify(checkedClasses)) {
      setCheckedClasses(updatedCheckedClasses);
    }
    setIndeterminateState(updatedIndeterminateState);
  }, [expandedState, checkedClasses, filteredLegendItems, selectedDiseases, setCheckedClasses]);

  const handleMainCategoryChange = (className, checked) => {
    onClassChange(className, checked);

    let targetItem = null;
    filteredLegendItems.forEach((group) => {
      group.items.forEach((item) => {
        if (item.class === className) {
          targetItem = item;
        }
      });
    });

    if (targetItem) {
      setExpandedState((prev) => {
        const updated = { ...prev };
        Object.entries(updated).forEach(([id, details]) => {
          if (String(details.label) !== String(targetItem.class)) {
            return;
          }
          if (details.type === "Disease" && !selectedDiseases.includes(id)) {
            return;
          }
          updated[id] = { ...details, visible: checked };
        });
        return updated;
      });
      setIndeterminateState((prev) => ({ ...prev, [className]: false }));
    }
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
      {selectedDiseases.length === 0 ? (
        <Col span={24}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Select diseases in the dropdown to see related filters"
          />
        </Col>
      ) : filteredLegendItems.length === 0 ? (
        <Col span={24}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No filter categories found for the selected diseases"
          />
        </Col>
      ) : (
        filteredLegendItems.map((group, groupIndex) => (
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                  paddingBottom: "8px",
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <Text strong style={{ fontSize: "14px" }}>
                  {group.group}
                </Text>
                <ToggleCategory
                  type={group.group}
                  legendItems={filteredLegendItems}
                  checkedClasses={checkedClasses}
                  setCheckedClasses={setCheckedClasses}
                  expandedState={expandedState}
                  setExpandedState={setExpandedState}
                />
              </div>

              {group.items.map((item, index) => {
                const expandedEntries = getExpandedEntriesForItem(item);

                return (
                  <div
                    key={index}
                    style={{
                      marginBottom: index === group.items.length - 1 ? 0 : "10px",
                      background: "#fff",
                      borderRadius: "6px",
                      padding: "8px",
                      border: "1px solid #f0f0f0",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{ cursor: "pointer", fontSize: "11px", color: "#8c8c8c", width: "14px" }}
                        onClick={() => toggleExpand(item.class)}
                      >
                        {expandedClasses[item.class] ? "▼" : "▶"}
                      </div>

                      {renderShape(item)}

                      <Checkbox
                        checked={checkedClasses[item.class]}
                        indeterminate={indeterminateState[item.class]}
                        onChange={(e) => handleMainCategoryChange(item.class, e.target.checked)}
                      />

                      <Text style={{ fontSize: "13px", flex: 1 }}>{item.label}</Text>

                      <Tag style={{ margin: 0, fontSize: "11px" }}>{expandedEntries.length}</Tag>
                    </div>

                    {expandedClasses[item.class] && expandedEntries.length > 0 && (
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

                        <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                          <Button
                            size="small"
                            type="primary"
                            onClick={() => {
                              const filtered = getExpandedEntriesForItem(item);
                              setExpandedState((prev) => {
                                const updated = { ...prev };
                                filtered.forEach(([id]) => {
                                  updated[id].visible = true;
                                });
                                return updated;
                              });
                            }}
                          >
                            Select All
                          </Button>
                          <Button
                            size="small"
                            danger
                            onClick={() => {
                              const filtered = getExpandedEntriesForItem(item);
                              setExpandedState((prev) => {
                                const updated = { ...prev };
                                filtered.forEach(([id]) => {
                                  updated[id].visible = false;
                                });
                                return updated;
                              });
                            }}
                          >
                            Unselect All
                          </Button>
                        </div>

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
                          {expandedEntries.map(([id, details]) => (
                            <li
                              key={id}
                              style={{
                                padding: "5px 0",
                                borderBottom: "1px solid #f0f0f0",
                              }}
                            >
                              <Checkbox
                                checked={details.visible}
                                onChange={(e) =>
                                  setExpandedState((prev) => ({
                                    ...prev,
                                    [id]: { ...prev[id], visible: e.target.checked },
                                  }))
                                }
                              >
                                <Text style={{ fontSize: "12px" }}>{id}</Text>
                              </Checkbox>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Col>
        ))
      )}
    </Row>
  );
};

export default Legend;
