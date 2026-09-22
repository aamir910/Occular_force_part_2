import React, { useEffect, useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { Card, Select, Row, Col, Button, Modal } from "antd";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import ForceNetworkGraph from "./forceNetworkGraph/ForceNetworkGraph";
import Legend from "./Legend/Legend";

const DEFAULT_FILTER_TYPE = "disease_name";
const DEFAULT_SELECTED_DISEASES = [
  "POROKERATOSIS",
  "PROLIFERATIVE DIABETIC RETINOPATHY",
  "PROLIFERATIVE VITREORETINOPATHY",
];

const FILTER_TYPE_OPTIONS = [
  { value: "disease_name", label: "Disease Name" },
  { value: "disease_class", label: "Disease Class" },
  { value: "gene_category", label: "Gene Category" },
  { value: "gene_name", label: "Gene Name" },
  { value: "drug_name", label: "Drug Name" },
];

const FILTER_VALUE_PLACEHOLDERS = {
  disease_name: "Select one or more disease names",
  disease_class: "Select one or more disease classes",
  gene_category: "Select one or more gene categories",
  gene_name: "Select one or more gene names",
  drug_name: "Select one or more drug names",
};

const normalizeDiseaseCategory = (category) => {
  if (category == null) return category;
  const aliases = {
    "Eye Nwoplasms": "Eye Neoplasms",
    "Refractive errors": "Refractive Errors",
    "Retinal diseases": "Retinal Diseases",
    "Lens diseases": "Lens Diseases",
    "Ocular hypertension": "Ocular Hypertension",
    "Ocular motility disorders": "Ocular Motility Disorders",
    "Uveal diseases": "Uveal Diseases",
    "Corneal diseases": "Corneal Diseases",
    "Conjunctival diseases": "Conjunctival Diseases",
    "Orbital diseases": "Orbital Diseases",
    "Lacrimal Apparatus diseases": "Lacrimal Apparatus Diseases",
  };
  const trimmed = String(category).trim();
  return aliases[trimmed] || trimmed;
};

function App() {
  const [jsonData, setJsonData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [checkedClasses, setCheckedClasses] = useState({
    "Refractive Errors": false,
    "Retinal Diseases": false,
    Others: false,
    "Lens Diseases": false,
    "Ocular Hypertension": false,
    "Ocular Motility Disorders": false,
    "Uveal Diseases": false,
    "Corneal Diseases": false,
    "Conjunctival Diseases": false,
    "Orbital Diseases": false,
    "Eye Neoplasms": false,
    "Lacrimal Apparatus Diseases": false,
    Pseudogene: false,
    "Genetic Locus": false,
    lncRNA: false,
    miRNA: false,
    mt_tRNA: false,
    Other: false,
    "Protein coding": false,
    "RNA gene": false,
    "0": false,
    "1": false,
    "2": false,
    "3": false,
    "4": false,
    "5": false,
  });

  const [expandedState, setExpandedState] = useState({});
  const [availableClasses, setAvailableClasses] = useState({
    "Refractive Errors": false,
    "Retinal Diseases": false,
    Others: false,
    "Lens Diseases": false,
    "Ocular Hypertension": false,
    "Ocular Motility Disorders": false,
    "Uveal Diseases": false,
    "Corneal Diseases": false,
    "Conjunctival Diseases": false,
    "Orbital Diseases": false,
    "Eye Neoplasms": false,
    "Lacrimal Apparatus Diseases": false,
    Pseudogene: false,
    "Genetic Locus": false,
    lncRNA: false,
    miRNA: false,
    mt_tRNA: false,
    Other: false,
    "Protein coding": false,
    "RNA gene": false,
    "0": false,
    "1": false,
    "2": false,
    "3": false,
    "4": false,
    "5": false,
  });
  const [availableIds, setAvailableIds] = useState({});
  const [filterType, setFilterType] = useState(DEFAULT_FILTER_TYPE);
  const [selectedFilterValues, setSelectedFilterValues] = useState(DEFAULT_SELECTED_DISEASES);
  const [filterOptions, setFilterOptions] = useState({
    disease_name: [],
    disease_class: [],
    gene_category: [],
    gene_name: [],
    drug_name: [],
  });
  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const rowRef = useRef(null);
  const hasInitialFilterApplied = useRef(false);
  const { Option } = Select;

  useEffect(() => {
    fetchExcelFile();
  }, []);

  const fetchExcelFile = async () => {
    try {
      const response = await fetch("/Gene_Disease_final_file_merged_2.xlsx");
      const data = await response.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      console.log("Excel data loaded:", jsonData);
      setJsonData(jsonData);
      extractFilterOptions(jsonData);
      setOriginalData(jsonData);
    } catch (error) {
      console.error("Error reading the Excel file:", error);
    }
  };

  const extractFilterOptions = (data) => {
    const diseaseNames = new Set();
    const diseaseClasses = new Set();
    const geneCategories = new Set();
    const geneNames = new Set();
    const drugNames = new Set();

    data.forEach((row) => {
      if (row.Disease) diseaseNames.add(row.Disease);
      const diseaseClass = normalizeDiseaseCategory(row.Disease_category);
      if (diseaseClass) diseaseClasses.add(diseaseClass);
      if (row["Gene category"]) geneCategories.add(row["Gene category"]);
      if (row.Gene) geneNames.add(row.Gene);
      if (row.Drug_name) drugNames.add(row.Drug_name);
    });

    const sorted = (set) => Array.from(set).sort((a, b) => String(a).localeCompare(String(b)));

    setFilterOptions({
      disease_name: sorted(diseaseNames),
      disease_class: sorted(diseaseClasses),
      gene_category: sorted(geneCategories),
      gene_name: sorted(geneNames),
      drug_name: sorted(drugNames),
    });

    const validDefaults = DEFAULT_SELECTED_DISEASES.filter((disease) =>
      diseaseNames.has(disease)
    );
    if (validDefaults.length > 0) {
      setSelectedFilterValues(validDefaults);
    }
  };

  const rowMatchesPrimaryFilter = (row, type, values) => {
    if (!values.length) return false;

    switch (type) {
      case "disease_name":
        return values.includes(row.Disease);
      case "disease_class":
        return values.includes(normalizeDiseaseCategory(row.Disease_category));
      case "gene_category":
        return values.includes(row["Gene category"]);
      case "gene_name":
        return values.includes(row.Gene);
      case "drug_name":
        return values.includes(row.Drug_name);
      default:
        return false;
    }
  };

  const buildExpandedStateFromData = (data) => {
    const initialState = {};

    data.forEach((row) => {
      const disease = row.Disease;
      const gene = row.Gene;
      const drug = row.Drug_name;

      if (disease && !initialState[disease]) {
        initialState[disease] = {
          visible: false,
          label: normalizeDiseaseCategory(row.Disease_category),
          type: "Disease",
        };
      }

      if (gene && !initialState[gene]) {
        initialState[gene] = {
          visible: false,
          label: row["Gene category"],
          type: "Gene",
        };
      }

      if (drug && !initialState[drug]) {
        initialState[drug] = {
          visible: false,
          label: String(row.Phase),
          type: "Drug",
        };
      }
    });

    return initialState;
  };

  const createNodesAndLinks = (data) => {
    const nodesMap = new Map();
    const links = [];

    data.forEach((row) => {
      const disease = row.Disease;
      const gene = row.Gene;
      const drug = row.Drug_name;
      const Phenotypes = row.Phenotypes;
      const class_disease = normalizeDiseaseCategory(row.Disease_category);
      const class_gene = row["Gene category"];
      const class_drug = row.Phase;

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

      if (drug && !nodesMap.has(drug)) {
        nodesMap.set(drug, {
          id: drug,
          type: "Drug",
          class: class_drug !== undefined && class_drug !== null ? String(class_drug) : class_drug,
          Drug_name: drug,
          Phase: row.Phase,
        });
      }

      if (disease && gene) {
        links.push({ source: disease, target: gene, DOIs: row.DOIs });
      }
      if (disease && drug) {
        links.push({ source: disease, target: drug, DOIs: row.DOIs });
      }
    });

    return { nodes: Array.from(nodesMap.values()), links };
  };

  const syncLegendFromGraph = useCallback((graph) => {
    const presentIds = new Set((graph?.nodes || []).map((node) => node.id));
    const presentClasses = new Set(
      (graph?.nodes || []).map((node) => String(node.class))
    );

    setAvailableClasses((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        next[key] = presentClasses.has(String(key));
      });
      presentClasses.forEach((cls) => {
        next[cls] = true;
      });
      return next;
    });

    setAvailableIds(() => {
      const next = {};
      presentIds.forEach((id) => {
        next[id] = true;
      });
      return next;
    });

    setCheckedClasses((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        next[key] = presentClasses.has(String(key));
      });
      return next;
    });

    setExpandedState((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        next[id] = {
          ...next[id],
          visible: presentIds.has(id),
        };
      });
      return next;
    });
  }, []);

  const handleClassCheckboxChange = (className, checked) => {
    setCheckedClasses((prev) => ({
      ...prev,
      [className]: checked,
    }));
  };

  const applyFilters = useCallback(() => {
    if (!jsonData) return;

    if (selectedFilterValues.length === 0) {
      setGraphData({ nodes: [], links: [] });
      syncLegendFromGraph({ nodes: [], links: [] });
      return;
    }

    const hasLegendChecks = Object.values(checkedClasses).some(Boolean);

    const filteredData = jsonData.filter((row) => {
      if (!rowMatchesPrimaryFilter(row, filterType, selectedFilterValues)) {
        return false;
      }

      if (!hasLegendChecks) {
        return true;
      }

      const diseaseCategory = normalizeDiseaseCategory(row.Disease_category);
      const geneCategory = row["Gene category"];
      const phaseValue = row?.Phase !== undefined && row?.Phase !== null ? String(row.Phase) : undefined;
      const disease = row.Disease;
      const gene = row.Gene;
      const drug = row.Drug_name;

      const classMatched =
        (diseaseCategory && checkedClasses[diseaseCategory]) ||
        (geneCategory && checkedClasses[geneCategory]) ||
        (phaseValue && checkedClasses[phaseValue]);

      if (!classMatched) return false;

      if (disease && expandedState[disease] !== undefined && !expandedState[disease].visible) {
        return false;
      }
      if (gene && expandedState[gene] !== undefined && !expandedState[gene].visible) {
        return false;
      }
      if (drug && expandedState[drug] !== undefined && !expandedState[drug].visible) {
        return false;
      }

      return true;
    });

    const newGraphData = createNodesAndLinks(filteredData);
    setGraphData(newGraphData);
    syncLegendFromGraph(newGraphData);
  }, [jsonData, filterType, selectedFilterValues, checkedClasses, expandedState, syncLegendFromGraph]);

  useEffect(() => {
    if (jsonData) {
      setExpandedState(buildExpandedStateFromData(jsonData));
    }
  }, [jsonData]);

  useEffect(() => {
    if (
      jsonData &&
      selectedFilterValues.length > 0 &&
      !hasInitialFilterApplied.current
    ) {
      hasInitialFilterApplied.current = true;
      applyFilters();
    }
  }, [jsonData, selectedFilterValues, applyFilters]);

  const clearGraphUntilFilter = () => {
    if (hasInitialFilterApplied.current) {
      setGraphData({ nodes: [], links: [] });
      syncLegendFromGraph({ nodes: [], links: [] });
    }
  };

  const handleFilterTypeChange = (value) => {
    setFilterType(value);
    setSelectedFilterValues([]);
    clearGraphUntilFilter();
  };

  const handleFilterValuesChange = (value) => {
    setSelectedFilterValues(value);
    clearGraphUntilFilter();
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
        const disease = row.Disease;
        const gene = row.Gene;
        const drug = row.Drug_name;
        const class_disease = normalizeDiseaseCategory(row.Disease_category);
        const class_gene = row["Gene category"];
        const class_drug = row.Phase;

        if (!checkedClasses[class_disease]) {
          return false;
        }

        if (!checkedClasses[class_gene]) {
          return false;
        }

        if (class_drug && !checkedClasses[class_drug]) {
          return false;
        }

        if (disease && expandedState[disease] !== undefined && !expandedState[disease].visible) {
          return false;
        }

        if (gene && expandedState[gene] !== undefined && !expandedState[gene].visible) {
          return false;
        }

        if (drug && expandedState[drug] !== undefined && !expandedState[drug].visible) {
          return false;
        }

        return true;
      });

      if (jsonData2.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(jsonData2);
        const book = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(book, worksheet, "Filtered_Gene_Disease");
        XLSX.writeFile(book, "Filtered_Gene_Disease_data.xlsx");
      } else {
        console.log("No filtered data to export.");
      }
    } else {
      console.log("No data available to export.");
    }
  };

  const exportGraphImage = async (format) => {
    if (rowRef.current) {
      const canvas = await html2canvas(rowRef.current);
      let filename, dataURL;

      switch (format) {
        case "png":
          filename = "graph_screenshot.png";
          dataURL = canvas.toDataURL("image/png");
          break;
        case "jpg":
          filename = "graph_screenshot.jpg";
          dataURL = canvas.toDataURL("image/jpeg");
          break;
        case "svg": {
          filename = "graph_screenshot.svg";
          const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}"><image width="${canvas.width}" height="${canvas.height}" href="${canvas.toDataURL("image/png")}"/></svg>`;
          const blob = new Blob([svgData], { type: "image/svg+xml" });
          saveAs(blob, filename);
          return;
        }
        default:
          return;
      }

      const link = document.createElement("a");
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
            title="Legend Filters"
            bordered
            style={{
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
            }}
          >
            <Legend
              checkedClasses={checkedClasses}
              expandedState={expandedState}
              availableClasses={availableClasses}
              availableIds={availableIds}
              onClassChange={handleClassCheckboxChange}
              setExpandedState={setExpandedState}
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
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="filter-type"
                style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
              >
                Filter Type
              </label>
              <Select
                id="filter-type"
                value={filterType}
                onChange={handleFilterTypeChange}
                style={{ width: "100%", marginBottom: "12px" }}
                options={FILTER_TYPE_OPTIONS}
              />

              {filterType && (
                <>
                  <label
                    htmlFor="filter-values"
                    style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
                  >
                    {
                      FILTER_TYPE_OPTIONS.find((option) => option.value === filterType)
                        ?.label
                    }
                  </label>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <Select
                      id="filter-values"
                      mode="multiple"
                      showSearch
                      allowClear
                      placeholder={FILTER_VALUE_PLACEHOLDERS[filterType]}
                      value={selectedFilterValues}
                      onChange={handleFilterValuesChange}
                      optionFilterProp="children"
                      style={{ flex: 1 }}
                    >
                      {(filterOptions[filterType] || []).map((option) => (
                        <Option key={option} value={option}>
                          {option}
                        </Option>
                      ))}
                    </Select>
                    <Button
                      type="primary"
                      onClick={applyFilters}
                      disabled={selectedFilterValues.length === 0}
                    >
                      Filter Data
                    </Button>
                  </div>
                </>
              )}
            </div>

            {graphData.nodes.length > 0 && graphData.links.length > 0 ? (
              <ForceNetworkGraph nodes={graphData.nodes} links={graphData.links} />
            ) : (
              <p
                style={{
                  paddingRight: "45rem",
                  width: "99%",
                  overflow: "hidden",
                }}
              >
                Select filter values and click Filter Data to view the graph.
              </p>
            )}
          </Card>
        </Col>
      </Row>

      <Modal title="Export Options" open={isBoxOpen} onCancel={handleCloseBox} footer={null}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <Button type="primary" size="small" style={{ width: "150px" }} onClick={exportToExcel}>
            Export to Excel
          </Button>
          <Button
            type="primary"
            size="small"
            style={{ width: "150px" }}
            onClick={() => exportGraphImage("png")}
          >
            Download as PNG
          </Button>
          <Button
            type="primary"
            size="small"
            style={{ width: "150px" }}
            onClick={() => exportGraphImage("jpg")}
          >
            Download as JPG
          </Button>
          <Button
            type="primary"
            size="small"
            style={{ width: "150px" }}
            onClick={() => exportGraphImage("svg")}
          >
            Download as SVG
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default App;
