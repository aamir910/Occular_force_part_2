
import { React, useState } from "react";
import {  Row, Col, Checkbox, Input } from "antd";
import ToggleCategory from "./ToggleCategory";

const Legend = ({
  checkedClasses,
  onClassChange,
  selectedValues,
  setCheckedClasses,
  expandedState,
  setExpandedState,
}) => {
  const [expandedClasses, setExpandedClasses] = useState({});
  const [searchQueries, setSearchQueries] = useState({});

  const legendItems = [
    {
      group: "Disease",
      items: [
        {
          shape: "triangle",
          color: "red",
          label: "Refractive errors",
          class: "Refractive errors",
        },
        {
          shape: "triangle",
          color: "blue",
          label: "Retinal diseases",
          class: "Retinal diseases",
        },
        { shape: "triangle", color: "green", label: "Others", class: "Others" },
        {
          shape: "triangle",
          color: "orange",
          label: "Lens diseases",
          class: "Lens diseases",
        },
        {
          shape: "triangle",
          color: "purple",
          label: "Ocular hypertension",
          class: "Ocular hypertension",
        },
        {
          shape: "triangle",
          color: "pink",
          label: "Ocular motility disorders",
          class: "Ocular motility disorders",
        },
        {
          shape: "triangle",
          color: "cyan",
          label: "Uveal diseases",
          class: "Uveal diseases",
        },
        {
          shape: "triangle",
          color: "magenta",
          label: "Corneal diseases",
          class: "Corneal diseases",
        },
        {
          shape: "triangle",
          color: "lime",
          label: "Conjunctival diseases",
          class: "Conjunctival diseases",
        },
        {
          shape: "triangle",
          color: "teal",
          label: "Orbital diseases",
          class: "Orbital diseases",
        },
        {
          shape: "triangle",
          color: "salmon",
          label: "Eye Neoplasms",
          class: "Eye Neoplasms",
        },
        {
          shape: "triangle",
          color: "violet",
          label: "Lacrimal Apparatus diseases",
          class: "Lacrimal Apparatus diseases",
        },
      ],
    },
  
    {
      group: "Gene",
      items: [
        {
          shape: "circle",
          color: "brown",
          label: "Pseudogene",
          class: "Pseudogene",
        },
        {
          shape: "circle",
          color: "darkgreen",
          label: "Genetic Locus",
          class: "Genetic Locus",
        },
        { shape: "circle", color: "orange", label: "lncRNA", class: "lncRNA" },
        { shape: "circle", color: "purple", label: "miRNA", class: "miRNA" },
        {
          shape: "circle",
          color: "darkblue",
          label: "mt_tRNA",
          class: "mt_tRNA",
        },
        { shape: "circle", color: "gray", label: "Other", class: "Other" },
        {
          shape: "circle",
          color: "yellow",
          label: "Protein coding",
          class: "Protein coding",
        },
        {
          shape: "circle",
          color: "pink",
          label: "RNA gene",
          class: "RNA gene",
        },
      ],
    },
  ];

  const filteredLegendItems = legendItems.map((group) => ({
    ...group,
    items: selectedValues.length === 0 ? group.items : group.items,
  }));

  const toggleExpand = (className) => {
    setExpandedClasses((prev) => ({
      ...prev,
      [className]: !prev[className],
    }));
  };

  return (
        <Row style={{ 
          maxHeight: "100vh", 
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "#888 #f1f1f1" 
        }}>
      {filteredLegendItems.map((group, groupIndex) => (
        <Col
          key={groupIndex}
          span={24}
          style={{ marginTop: group.group === "" ? "25px" : "0" }}
        >
          <dl style={{ margin: 0, padding: 0 }}>
            <dt
              style={{
                fontWeight: "bold",
                display: "flex",
                alignItems: "start",
                justifyContent: "flex-start",
                fontSize: "15px",
                marginBottom: group.group === "Others" ? "10px" : "0",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {group.group || null}
                <ToggleCategory
                  type={group.group}
                  legendItems={legendItems}
                  checkedClasses={checkedClasses}
                  setCheckedClasses={setCheckedClasses}
                />
              </div>
            </dt>
            
            {group.items.map((item, index) => (
              <dd
                key={index}
                style={{
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "start",
                  justifyContent: "flex-start",
                  flexDirection: "column",
                  marginLeft: 0,
                }}
              >
                <div style={{ 
                  marginBottom: "8px",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  marginLeft: 0,
                }}>
                  <div
                    style={{ cursor: "pointer", marginRight: "8px" }}
                    onClick={() => toggleExpand(item.class)}
                  >
                    {expandedClasses[item.class] ? "▼" : "▶"}
                  </div>

                  {item.shape === "triangle" && (
                    <>
                      <div style={{ margin: "5px" }}>
                        <svg width="20" height="20" style={{ marginRight: "2px" }}>
                          <polygon points="10,0 0,20 20,20" fill={item.color} />
                        </svg>
                      </div>
                      <Checkbox
                        checked={checkedClasses[item.class]}
                        onChange={(e) => onClassChange(item.class, e.target.checked)}
                        style={{ marginLeft: "2px" }}
                      />
                    </>
                  )}
                  
                  {item.shape === "circle" && (
                    <>
                      <div style={{ margin: "5px" }}>
                        <svg width="20" height="20" style={{ marginRight: "2px", marginTop: "5px" }}>
                          <circle cx="10" cy="10" r="10" fill={item.color} />
                        </svg>
                      </div>
                      <Checkbox
                        checked={checkedClasses[item.class]}
                        onChange={(e) => onClassChange(item.class, e.target.checked)}
                        style={{ marginLeft: "2px" }}
                      />
                    </>
                  )}

                  <div style={{ marginLeft: "3px" }}>{item.label}</div>
                </div>

                {expandedClasses[item.class] && (
                  <div style={{ marginTop: "10px", width: "100%" }}>
                    <Input
                      placeholder="Search..."
                      style={{ marginBottom: "10px", maxWidth: "250px" }}
                      value={searchQueries[item.class] || ""}
                      onChange={(e) => {
                        setSearchQueries(prev => ({
                          ...prev,
                          [item.class]: e.target.value.toLowerCase()
                        }));
                      }}
                    />

                    <div style={{ 
                      marginBottom: "10px",
                      display: "flex",
                      gap: "10px",
                    }}>
                      <button
                        style={{
                          padding: "5px 10px",
                          borderRadius: "5px",
                          backgroundColor: "#1890ff",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          const currentQuery = searchQueries[item.class] || "";
                          const filteredItems = Object.entries(expandedState)
                            .filter(([id, details]) => 
                              details.label === item.label &&
                              id.toLowerCase().includes(currentQuery)
                            );

                          setExpandedState(prev => {
                            const newState = {...prev};
                            filteredItems.forEach(([id]) => {
                              newState[id] = {...newState[id], visible: true};
                            });
                            return newState;
                          });
                        }}
                      >
                        Select All
                      </button>
                      <button
                        style={{
                          padding: "5px 10px",
                          borderRadius: "5px",
                          backgroundColor: "#ff4d4f",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          const currentQuery = searchQueries[item.class] || "";
                          const filteredItems = Object.entries(expandedState)
                            .filter(([id, details]) => 
                              details.label === item.label &&
                              id.toLowerCase().includes(currentQuery)
                            );

                          setExpandedState(prev => {
                            const newState = {...prev};
                            filteredItems.forEach(([id]) => {
                              newState[id] = {...newState[id], visible: false};
                            });
                            return newState;
                          });
                        }}
                      >
                        Unselect All
                      </button>
                    </div>

                    <ul
                      style={{
                        marginTop: "2px",
                        maxHeight: "300px",
                        overflowY: "auto",
                        border: "1px solid #d9d9d9",
                        borderRadius: "5px",
                        maxWidth: "250px",
                        scrollbarWidth: "thin",
                      }}
                    >
                      {Object.entries(expandedState)
                        .filter(([id, details]) => {
                          const currentQuery = searchQueries[item.class] || "";
                          return (
                            details.label === item.label &&
                            id.toLowerCase().includes(currentQuery)
                          );
                        })
                        .map(([id, details]) => (
                          <li
                            key={id}
                            style={{
                              listStyle: "none",
                              borderBottom: "1px solid #e8e8e8",
                            }}
                          >
                            <Checkbox
                              checked={details.visible}
                              onChange={(e) => {
                                setExpandedState(prev => ({
                                  ...prev,
                                  [id]: {
                                    ...prev[id],
                                    visible: e.target.checked
                                  }
                                }));
                              }}
                            >
                              {id}
                            </Checkbox>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </dd>
            ))}
          </dl>
        </Col>
      ))}
    </Row>
  );
};

export default Legend;