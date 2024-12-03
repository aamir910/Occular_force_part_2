import React, { useState } from "react";
import { Input, Checkbox } from "antd";

const ExpandableList = ({
  label,
  className,
  items,
  expandedState,
  setExpandedState,
}) => {
  const [isExpanded, setIsExpanded] = useState(false); // Toggle expansion
  const [searchQuery, setSearchQuery] = useState(""); // Filter query

  // Filter items based on the search query
  
  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(searchQuery)
  );

  // Toggle expansion
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle visibility changes for individual items
  const handleVisibilityChange = (id, isChecked) => {
    setExpandedState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        visible: isChecked,
      },
    }));
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          fontWeight: "bold",
          marginBottom: "8px",
        }}
        onClick={handleToggleExpand}
      >
        {isExpanded ? "▼" : "▶"} {label}
      </div>
      {isExpanded && (
        <div style={{ paddingLeft: "16px" }}>
          <Input
            placeholder="Search..."
            style={{ marginBottom: "10px" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
          />
          <ul style={{ maxHeight: "200px", overflowY: "auto", padding: 0 }}>
            {filteredItems.map((item, idx) => (
              <li key={idx} style={{ listStyle: "none", marginBottom: "8px" }}>
                <Checkbox
                  checked={expandedState[item]?.visible || false}
                  onChange={(e) =>
                    handleVisibilityChange(item, e.target.checked)
                  }
                >
                  {item}
                </Checkbox>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExpandableList;
