import React, { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Card, Select, Row, Col, Button, Modal } from "antd";
import html2canvas from "html2canvas";
import { saveAs } from 'file-saver';
import ForceNetworkGraph from "./forceNetworkGraph/ForceNetworkGraph";
import Legend from "./Legend/Legend";

function App() {
  const [jsonData, setJsonData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [checkedClasses, setCheckedClasses] = useState({
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
  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const rowRef = useRef(null);
  const { Option } = Select;

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
      setJsonData(jsonData);
      extractUniqueClasses(jsonData);
      setOriginalData(jsonData);
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

  const createNodesAndLinks = (data) => {
    let filteredRows = [];
    const nodesMap = new Map();
    const links = [];

    data.forEach((row) => {
      const disease = row.Disease;
      const gene = row.Gene;
      const Phenotypes = row.Phenotypes;
      const class_disease = row.Disease_category;
      const class_gene = row["Gene category"];

      if (checkedClasses[row.Disease_category]) {
        filteredRows.push(row);
      }

      extractUniqueClasses(filteredRows);

      if (disease && expandedState[disease] !== undefined) {
        if (!expandedState[disease].visible) {
          return;
        }
      }
      if (gene && expandedState[gene] !== undefined) {
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

      if (disease && gene) {
        links.push({ source: disease, target: gene, DOIs: row.DOIs });
      }
    });

    return { nodes: Array.from(nodesMap.values()), links };
  };

  useEffect(() => {
    if (jsonData) {
      const newGraphData = createNodesAndLinks(jsonData);
      const initialState = newGraphData.nodes
        .filter((item) => item.type === "Disease" || item.type === "Gene")
        .reduce((acc, item) => {
          acc[item.id] = {
            visible: true,
            label: item.class,
            type: item.type,
          };
          return acc;
        }, {});
      setExpandedState(initialState);
      setGraphData(newGraphData);
    }
  }, [jsonData]);

  const handleClassCheckboxChange = (className, checked) => {
    setCheckedClasses((prevCheckedClasses) => ({
      ...prevCheckedClasses,
      [className]: checked,
    }));
  };

  const handleFilterData = ({ selectedClasses, selectedExpandedItems }) => {
    if (jsonData) {
      let jsonData2 = jsonData.filter((row) => {
        const diseaseCategory = row.Disease_category;
        const geneCategory = row["Gene category"];
        return (
          selectedClasses.includes(diseaseCategory) &&
          selectedClasses.includes(geneCategory)
        );
      });

      const newGraphData = createNodesAndLinks(jsonData2);
      setGraphData(newGraphData);
    }
  };

  const handleSelectionChange = (value) => {
    setSelectedValues(value);
  };

  const applyFilter = () => {
    if (jsonData) {
      if (selectedValues.length !== 0) {
        const filtered = originalData.filter((row) =>
          selectedValues.includes(row["Disease"])
        );
        setJsonData(filtered);
        if (filtered.length > 0) {
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
      } else {
        setJsonData(originalData);
        setUniqueModes([]);
      }
    }
  };

  const handleOpenBox = () => {
    setIsBoxOpen(true);
  };

  const handleCloseBox = () => {
    setIsBoxOpen(false);
  };

  const exportToExcel = () => {
    if (jsonData) {
      const jsonData2 = jsonData.filter((row) => {
        return checkedClasses[row.Disease_category] && 
               checkedClasses[row["Gene category"]];
      });

      if (jsonData2.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(jsonData2);
        const book = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(book, worksheet, "Filtered_Gene_Disease");
        XLSX.writeFile(book, "Filtered_Gene_Disease_data.xlsx");
      } else {
        console.log("No filtered data to export.");
      }
    }
  };

  const exportGraphImage = async (format) => {
    if (rowRef.current) {
      const canvas = await html2canvas(rowRef.current);
      let filename, dataURL;
      
      switch(format) {
        case 'png':
          filename = 'graph_screenshot.png';
          dataURL = canvas.toDataURL('image/png');
          break;
        case 'jpg':
          filename = 'graph_screenshot.jpg';
          dataURL = canvas.toDataURL('image/jpeg');
          break;
        case 'svg':
          filename = 'graph_screenshot.svg';
          const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}"><image width="${canvas.width}" height="${canvas.height}" href="${canvas.toDataURL('image/png')}"/></svg>`;
          const blob = new Blob([svgData], { type: 'image/svg+xml' });
          saveAs(blob, filename);
          return;
        default:
          return;
      }
      
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataURL;
      link.click();
    } else {
      console.log("Row element not found.");
    }
  };

  return (
    <div className="app-container" style={{ padding: "2px", width: "100%" }}>
      <Row gutter={16} ref={rowRef}>
        <Col span={5} style={{ minWidth: "16%" }}>
          <Card
            title=""
            bordered
            style={{
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
            }}
          >
            <Legend
              checkedClasses={checkedClasses}
              onClassChange={handleClassCheckboxChange}
              selectedValues={uniqueModes}
              setCheckedClasses={setCheckedClasses}
              expandedState={expandedState}
              setExpandedState={setExpandedState}
              onFilterData={handleFilterData}
            />
          </Card>
        </Col>

        <Col span={18} style={{ minWidth: "65%" }}>
          <Card
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Anatomy gene based categorization</span>
                <Button type="primary" onClick={handleOpenBox}>
                  Export
                </Button>
              </div>
            }
            bordered
            style={{
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
            }}
          >
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
                }}
              >
                No data in current filtration...
              </p>
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title="Export Options"
        open={isBoxOpen}
        onCancel={handleCloseBox}
        footer={null}
      >
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px',
            alignItems: 'center'
          }}
        >
          <Button 
            type="primary" 
            size="small"
            style={{ width: '150px' }}  // Fixed width for all buttons
            onClick={exportToExcel}
          >
            Export to Excel
          </Button>
          <Button 
            type="primary" 
            size="small"
            style={{ width: '150px' }}  // Fixed width for all buttons
            onClick={() => exportGraphImage('png')}
          >
            Download as PNG
          </Button>
          <Button 
            type="primary" 
            size="small"
            style={{ width: '150px' }}  // Fixed width for all buttons
            onClick={() => exportGraphImage('jpg')}
          >
            Download as JPG
          </Button>
          <Button 
            type="primary" 
            size="small"
            style={{ width: '150px' }}  // Fixed width for all buttons
            onClick={() => exportGraphImage('svg')}
          >
            Download as SVG
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default App;