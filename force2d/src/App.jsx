import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Card, Select, Row, Col } from "antd";
import ForceNetworkGraph from "./forceNetworkGraph/ForceNetworkGraph";
import Legend from "./Legend/Legend";
import { Button } from "antd";

function App() {
  const [jsonData, setJsonData] = useState(null);

  const [originalData, setOriginalData] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [checkedClasses, setCheckedClasses] = useState({
    "Autosomal recessive": true,
    "X-linked dominant": true,
    Other: true,
    "Isolated cases": true,
    "Autosomal dominant": true,
    "X-linked recessive": true,
    Mitochondrial: true,
    "-": true,
    Isolated: true,
  });
  const [uniqueClasses, setUniqueClasses] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [uniqueModes, setUniqueModes] = useState([]);
  console.log(uniqueClasses, "uniqueClasses");
  const { Option } = Select;

  // Fetch Excel file on component mount
  useEffect(() => {
    fetchExcelFile();
  }, []);

  const fetchExcelFile = async () => {
    try {
      const response = await fetch("/Gene_Disease_final_file.xlsx");
      const data = await response.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

console.log(jsonData , "here is teh json data ")


      setJsonData(jsonData);
      extractUniqueClasses(jsonData);
      setOriginalData(jsonData); // Extract unique classes after setting jsonData
    } catch (error) {
      console.error("Error reading the Excel file:", error);
    }
  };

  const extractUniqueClasses = (data) => {
    const classes = new Set();
    data.forEach((row) => {
      const classOfNode = row["DISORDER"];
      if (classOfNode) {
        classes.add(classOfNode);
      }
    });
    setUniqueClasses(Array.from(classes));
  };

  const createNodesAndLinks = (data) => {
    const nodesMap = new Map();
    const links = [];
  
    data.forEach((row) => {
      const disease = row.Disease;
      const gene = row.Gene;
  
      if (disease && !nodesMap.has(disease)) {
        nodesMap.set(disease, {
          id: disease,
          type: "Disease",
          class: "Disease",
        });
      }
  
      if (gene && !nodesMap.has(gene)) {
        nodesMap.set(gene, {
          id: gene,
          type: "Gene",
          class: "Gene",
        });
      }
  
      // Add link from Disease to Gene
      if (disease && gene) {
        links.push({ source: disease, target: gene });
      }
    });
  
    return { nodes: Array.from(nodesMap.values()), links };
  };
  

  // Update graphData only when jsonData or checkedClasses change
  useEffect(() => {
    if (jsonData) {
      const newGraphData = createNodesAndLinks(jsonData);
      setGraphData(newGraphData);
    }
  }, [jsonData, checkedClasses]);

  const handleSelectionChange = (value) => {
    setSelectedValues(value);
  };

  const handleClassCheckboxChange = (className, checked) => {
    setCheckedClasses((prevCheckedClasses) => ({
      ...prevCheckedClasses,
      [className]: checked,
    }));
  };

  const applyFilter = () => {
    if (jsonData) {
      if (selectedValues.length !== 0) {
        const filtered = originalData.filter((row) =>
          selectedValues.includes(row["DISORDER"])
        );
        setJsonData(filtered);
        if (filtered.length > 0) {
          // Extract unique 'MODE OF INHERITANCE' values from filtered rows
          const uniqueModesArray = [
            ...new Set(filtered.map((row) => row["MODE OF INHERITANCE"])),
          ];
          setUniqueModes(uniqueModesArray);
        }

        console.log(selectedValues, "selectedValues");
      } else {
        setJsonData(originalData);
        setUniqueModes([]);
      }
    }
  };

  return (
    <div className="app-container" style={{ padding: "2px", width: "100%" }}>
      <Row gutter={16}>
        {/* Legend with checkboxes */}
        <Col span={4}>
          <Card
            title="Legend"
            bordered
            style={{
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
            }}>
            <Legend
              checkedClasses={checkedClasses}
              onClassChange={handleClassCheckboxChange}
              selectedValues={uniqueModes}
            />
          </Card>
        </Col>

        {/* 2D Force Network Graph */}
        <Col span={19}>
          <Card
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                <span>Inheritance based categorization</span>
                <div>
                  <Select
                    mode="multiple"
                    placeholder="Select disease"
                    dropdownStyle={{ maxHeight: "300px", overflowY: "auto" }}
                    style={{ minWidth: "200px", maxWidth: "900px" }}
                    onChange={handleSelectionChange}
                    value={selectedValues}
                    maxTagCount={2} // Adjust the number as needed
                    allowClear>
                    {uniqueClasses.map((className) => (
                      <Option key={className} value={className}>
                        {className}
                      </Option>
                    ))}
                  </Select>
                  <Button onClick={applyFilter}>Filter</Button>
                </div>
              </div>
            }
            bordered
            style={{
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
            }}>
            {graphData.nodes.length > 0 && graphData.links.length > 0 ? (
              <ForceNetworkGraph
                nodes={graphData.nodes}
                links={graphData.links}
              />
            ) : (
              <p>No data in current filtration...</p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default App;
