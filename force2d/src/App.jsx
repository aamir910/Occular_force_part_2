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
    // Disease Classes
    "Refractive errors": true,
    "Retinal diseases": true,
    Others: true,
    "Lens diseases": true,
    "Ocular hypertension": true,
    "Ocular motility disorders": true,
    "Uveal diseases": true,
    "Corneal diseases": true,
    "Conjunctival diseases": true,
    "Orbital diseases": true,
    "Eye Neoplasms": true,
    "Lacrimal Apparatus diseases": true,

    // Gene Classes
    Pseudogene: true,
    "Genetic Locus": true,
    lncRNA: true,
    miRNA: true,
    mt_tRNA: true,
    Other: true,
    "Protein coding": true,
    "RNA gene": true,
  });

  const [expandedState, setExpandedState] = useState({});
  
  const [uniqueClasses, setUniqueClasses] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [uniqueModes, setUniqueModes] = useState([]);
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
      console.log(jsonData, "jsonData");
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
      const classOfNode = row["Disease"];
      if (classOfNode) {
        classes.add(classOfNode);
      }
    });
    setUniqueClasses(Array.from(classes));
  };

  console.log(graphData , "Graphdata")
  const createNodesAndLinks = (data) => {
    let filteredRows = [];
    const nodesMap = new Map();
    const links = [];

    console.log(data);
    data.forEach((row) => {
      const disease = row.Disease;
      const gene = row.Gene;
      const Phenotypes = row.Phenotypes;
      const class_disease = row.Disease_category;
      const class_gene = row["Gene category"];

      if (checkedClasses[row.Disease_category]) {
        filteredRows.push(row); // Add the entire row to the filteredRows array
      }

      // Update the state with the filtered rows
      // SetDropDowndata(filteredRows);
      extractUniqueClasses(filteredRows);


        if ( disease && expandedState[disease] !== undefined) {
          if (!expandedState[disease].visible) {
            return;
          }
        }
        if ( gene && expandedState[gene] !== undefined) {
          if (!expandedState[gene].visible) {
            return;
          }
        }


      if (disease && !nodesMap.has(disease)) {
        nodesMap.set(disease, {
          id: disease,
          type: "Disease",
          class: class_disease,
          Phenotypes: Phenotypes,
        });
      }

      if (gene && !nodesMap.has(gene)) {
        nodesMap.set(gene, {
          id: gene,
          type: "Gene",
          class: class_gene,
          Gene: gene,
          Name: row.Name,
          GeneCategory: row.Synonyms,
          Location: row.Location,
          Strand: row.Strand,
          Description: row.Description,
          OMIM: row.OMIM,
          Ensembl: row.Ensembl,
          ClinVar: row.ClinVar,
          Decipher: row.Decipher,
          gnomAD: row.gnomAD,
          PanelApp: row.PanelApp,
        });
      }

      // Add link from Disease to Gene
      if (disease && gene) {
        links.push({ source: disease, target: gene, DOIs: row.DOIs });
      }
    });

    return { nodes: Array.from(nodesMap.values()), links };
  };

  // Update graphData only when jsonData or checkedClasses change
  useEffect(() => {
    if (jsonData) {
      let jsonData2 = jsonData.filter((row) => {
        // Check if Disease category is selected (true in checkedClasses)
        if (
          checkedClasses[row.Disease_category] &&
          checkedClasses[row["Gene category"]]
        ) {
          return true; // Keep the row if Disease is checked (true)
        }
        return false; // Exclude the row if neither is checked (false)
      });

      const newGraphData = createNodesAndLinks(jsonData2);

      
      const initialState = newGraphData.nodes
        .filter((item) => item.type === "Disease"  ||     item.type === "Gene"  ) 
        .reduce((acc, item) => {
          acc[item.id] = {
            visible: true, // Visibility flag
            label: item.class, // Store the label
        type: item.type 

          };
          return acc;
        }, {});

      setExpandedState(initialState);
      console.log("initialState" , initialState)

      setGraphData(newGraphData);
    }
  }, [jsonData, checkedClasses]);
  useEffect(() => {
    if (jsonData) {
      let jsonData2 = jsonData.filter((row) => {
        // Check if Disease category is selected (true in checkedClasses)
        if (
          checkedClasses[row.Disease_category] &&
          checkedClasses[row["Gene category"]]
        ) {
          return true; // Keep the row if Disease is checked (true)
        }
        return false; // Exclude the row if neither is checked (false)
      });

      const newGraphData = createNodesAndLinks(jsonData2);


      setGraphData(newGraphData);
    }
  }, [jsonData, checkedClasses ,expandedState]);

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
          selectedValues.includes(row["Disease"])
        );
        setJsonData(filtered);
        if (filtered.length > 0) {
          // Extract unique 'MODE OF INHERITANCE' values from filtered rows
          const uniqueModesArray = [
            ...new Set(
              filtered.flatMap((row) => [
                row["Disease_category"],
                row["Gene category"],
              ])
            ),
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
        <Col span={4} style={{ minWidth: "16%" }}>
          <Card
            title=""
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
              setCheckedClasses={setCheckedClasses}
              expandedState={expandedState}
              setExpandedState={setExpandedState}

            />
          </Card>
        </Col>

        {/* 2D Force Network Graph */}
        <Col span={19} style={{ minWidth: "65%" }}>
          <Card
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                <span>Anatomy based categorization</span>
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
              <p
                style={{
                  paddingRight: "45rem",
                  width: "99%",
                  overflow: "hidden",
                }}>
                No data in current filtration...
              </p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default App;
