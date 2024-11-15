import React from "react";
import { Row, Col, Checkbox } from "antd";

import ToggleCategory from "./ToggleCategory";

const Legend = ({
  checkedClasses,
  onClassChange,
  selectedValues,
  setCheckedClasses,
}) => {

  console.log(selectedValues , "selectedValues is here ")
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
  console.log(selectedValues, "checkedClasses checkedClasses");
  const filteredLegendItems = legendItems.map((group) => {
    // if (group.group === "") {
      return {
        ...group,
        items:
          selectedValues.length === 0
            ? group.items
            : group.items.filter((item) => selectedValues.includes(item.label)),
      };
    }
    // return group;
  // }
);

  return (
    <Row>
      {filteredLegendItems.map((group, groupIndex) => (
        <Col
          key={groupIndex}
          span={24}
          style={{ marginTop: group.group === "" ? "25px" : "0" }}>
          <dl style={{ margin: 0, padding: 0 }}>
            <dt
              style={{
                fontWeight: "bold",
                display: "flex",
                alignItems: "start",
                justifyContent: "flex-start",
                fontSize: "15px",
                marginBottom: group.group === "Others" ? "10px" : "0",
              }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}>
                {group.group || null}

                {group.group === "Disease" ? (
                  <ToggleCategory
                    type="Disease"
                    legendItems={legendItems}
                    checkedClasses={checkedClasses}
                    setCheckedClasses={setCheckedClasses}
                  />
                ) : (
                  <ToggleCategory
                    type="Gene"
                    legendItems={legendItems}
                    checkedClasses={checkedClasses}
                    setCheckedClasses={setCheckedClasses}
                  />
                )}
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
                  marginLeft: 0,
                }}>
                {item.shape === "triangle" && (
                  <>
                    <svg width="20" height="20" style={{ marginRight: "2px" }}>
                      <polygon points="10,0 0,20 20,20" fill={item.color} />
                    </svg>

                    <Checkbox
                      checked={checkedClasses[item.class]}
                      onChange={(e) =>
                        onClassChange(item.class, e.target.checked)
                      }
                      style={{ marginLeft: "2px" }}
                    />
                  </>
                )}
                {item.shape === "circle" && (
                  <>
                    <svg
                      width="20"
                      height="20"
                      style={{ marginRight: "2px", marginTop: "5px" }}>
                      <circle cx="10" cy="10" r="10" fill={item.color} />
                    </svg>
                    <Checkbox
                      checked={checkedClasses[item.class]}
                      onChange={(e) =>
                        onClassChange(item.class, e.target.checked)
                      }
                      style={{ marginLeft: "2px" }}
                    />
                  </>
                )}

                <div style={{ marginLeft: "3px" }}>{item.label}</div>
              </dd>
            ))}
          </dl>
        </Col>
      ))}
    </Row>
  );
};

export default Legend;
