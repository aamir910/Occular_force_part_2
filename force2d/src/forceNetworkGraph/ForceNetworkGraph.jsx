import React, { useRef, useEffect, useMemo, useState } from "react";
import { ForceGraph2D } from "react-force-graph";
import { Table, Button, AutoComplete } from "antd"; // Ant Design components

const ForceNetworkGraph = ({ nodes, links }) => {
  const graphRef = useRef();
  const [selectedNode, setSelectedNode] = useState(null); // State to manage selected node

  // Prepare graph data format for ForceGraph
  const graphData = useMemo(
    () => ({
      nodes: nodes.map((node) => ({
        id: node.id,
        group: node.type,
        class: node.class,
        Phenotypes: node.Phenotypes,
        Gene: node.Gene,
        Name: node.Name,
        GeneCategory: node.Synonyms,
        Location: node.Location,
        Strand: node.Strand,
        Description: node.Description,
        OMIM: node.OMIM,
        Ensembl: node.Ensembl,
        ClinVar: node.ClinVar,
        Decipher: node.Decipher,
        gnomAD: node.gnomAD,
        PanelApp: node.PanelApp,
      })),
      links: links.map((link) => ({
        source: link.source,
        target: link.target,
        DOIs: link.DOIs,
        group: "link",
      })),
    }),
    [nodes, links]
  );

  // Function to draw different node shapes based on the group and class
  const getNodeColor = (nodeClass) => {
    switch (nodeClass) {
      case "Refractive errors":
        return "red";
      case "Retinal diseases":
        return "blue";
      case "Others":
        return "green";
      case "Lens diseases":
        return "orange";
      case "Ocular hypertension":
        return "purple";
      case "Ocular motility disorders":
        return "pink";
      case "Uveal diseases":
        return "cyan";
      case "Corneal diseases":
        return "magenta";
      case "Conjunctival diseases":
        return "lime";
      case "Orbital diseases":
        return "teal";
      case "Eye Neoplasms":
        return "salmon";
      case "Lacrimal Apparatus diseases":
        return "violet";
      case "Pseudogene":
        return "brown";
      case "Genetic Locus":
        return "darkgreen";
      case "lncRNA":
        return "orange";
      case "miRNA":
        return "purple";
      case "mt_tRNA":
        return "darkblue";
      case "Other":
        return "gray";
      case "Protein coding":
        return "yellow";
      case "RNA gene":
        return "pink";
      default:
        return "black"; // Default color if class not found
    }
  };

  const drawNode = (node, ctx) => {
    const shapeSize = 10;
    const color = getNodeColor(node.class); // Get color based on class
    ctx.beginPath();
    ctx.fillStyle = color;

    if (node.group === "Disease") {
      // Draw triangle for 'Disease'
      ctx.moveTo(node.x, node.y - shapeSize);
      ctx.lineTo(node.x - shapeSize, node.y + shapeSize);
      ctx.lineTo(node.x + shapeSize, node.y + shapeSize);
      ctx.closePath();
    } else if (node.group === "Gene") {
      // Draw circle for 'Gene'
      ctx.arc(node.x, node.y, shapeSize, 0, 2 * Math.PI, false);
    }

    ctx.fill();

    // Optional: Add node ID label next to each node
    ctx.fillStyle = "black";
    ctx.font = "10px Arial";
    // ctx.fillText(node.id, node.x + shapeSize + 5, node.y);
  };

  // Handle node click to set selected node
  const handleNodeClick = (node) => {
    console.log(node, "node data here");
    setSelectedNode(node); // Set the selected node for table
  };

  // Set link distance and other forces
  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force("link").distance(150); // Set link distance
    }
  }, [graphData]);

  return (
    <div style={{ width: "99%", height: "100vh", overflow: "hidden" }}>
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeCanvasObject={drawNode}
        linkWidth={2}
        backgroundColor="white"
        nodeRelSize={10}
        enableZoomInteraction={true}
        onNodeClick={handleNodeClick} // Handle node click
        onLinkClick={handleNodeClick} // Handle link click
        nodeLabel={(node) => {
          return `<div style="background-color: black; color: white; padding: 5px; border-radius: 4px;">${node.id}</div>`;
        }}
      />
      {selectedNode && <DataTable node={selectedNode} onClose={() => setSelectedNode(null)} />}
    </div>
  );
};

const renderPhenotypes = (text) => {
  if (!text) return "N/A";

  // Ensure text is properly parsed as a string
  if (typeof text !== "string") {
    console.error("Unexpected data format in Phenotypes:", text);
    return "Invalid data";
  }

  // Split the string by ";"
  const phenotypeArray = text.split(";");

  // Process each phenotype
  return phenotypeArray.map((item, index) => {
    // Match OMIM entries in the item
    const omimMatch = item.match(/OMIM:(\d+)/);

    if (omimMatch) {
      const omimId = omimMatch[1]; // Extract OMIM ID
      const parts = item.split(`OMIM:${omimId}`); // Split the text into parts
      return (
        <div key={index}>
          {parts[0]}
          {/* Render text before OMIM */}
          <a href={`https://omim.org/entry/${omimId}`} target="_blank" rel="noopener noreferrer">
            OMIM:{omimId}
          </a>
          {parts[1]}
          {/* Render text after OMIM */}
        </div>
      );
    }

    return <div key={index}>{item}</div>; // Return item as-is if no OMIM link
  });
};

// DataTable component to display node details
const DataTable = ({ node, onClose }) => {
  // Define the columns for the Ant Design table
  const columns = [
    {
      title: "Property",
      dataIndex: "property",
      key: "property",
      render: (text) => (
        <div style={{ paddingTop: "1px", paddingBottom: "1px" }}>{text}</div>
      ),
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      render: (text, record) => {
        // Check if the property should be clickable
        if (["ClinVar", "Decipher", "gnomAD", "PanelApp"].includes(record.property)) {
          const url = node[record.property];
          return url ? (
            <a href={url} target="_blank" rel="noopener noreferrer">
              click here
            </a>
          ) : (
            "N/A"
          );
        } else if (node.group === "link") {
          // Split DOI entries by "; " and display each on a new line as clickable links
          if (text) {
            const doiList = text.split(";").map((doi, index) => {
              const trimmedDOI = doi.trim();
              const doiLink = `https://doi.org/${trimmedDOI}`;
              return (
                <div key={index}>
                  <a href={doiLink} target="_blank" rel="noopener noreferrer">
                    {trimmedDOI}
                  </a>
                </div>
              );
            });
            return doiList.length ? doiList : "N/A";
          }
        } else if (record.property === "Phenotypes") {
          return (
            <div
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                border: "1px solid #ddd",
                padding: "10px",
                borderRadius: "5px",
                backgroundColor: "#f9f9f9",
              }}
            >
              {renderPhenotypes(text)}
            </div>
          );
        }
        return text || "N/A"; // Default to "N/A" if value is undefined or empty
      },
    },
  ];

  // Conditionally add data based on the node.group value
  let dataSource = [];

  if (node.group === "Disease") {
    dataSource = [
      { key: "Phenotypes", property: "Phenotypes", value: node.Phenotypes },
    ];
  } else if (node.group === "link") {
    dataSource = [{ key: "DOIs", property: "DOIs", value: node.DOIs }];
  } else {
    dataSource = [
      { key: "Gene", property: "Gene", value: node.Gene },
      { key: "Name", property: "Name", value: node.Name },
      { key: "Location", property: "Location", value: node.Location },
      { key: "Strand", property: "Strand", value: node.Strand },
      { key: "Description", property: "Description", value: node.Description },
      { key: "OMIM", property: "OMIM", value: node.OMIM },
      { key: "Ensembl", property: "Ensembl", value: node.Ensembl },
      { key: "ClinVar", property: "ClinVar", value: node.ClinVar },
      { key: "Decipher", property: "Decipher", value: node.Decipher },
      { key: "gnomAD", property: "gnomAD", value: node.gnomAD },
      { key: "PanelApp", property: "PanelApp", value: node.PanelApp },
    ];
  }

  // Check if all values in dataSource are undefined, empty, or "N/A"
  const hasValidData = dataSource.some((item) => {
    const value = item.value;
    return value !== undefined && value !== "" && value !== null && value !== "N/A";
  });

  // Only render the table if there is at least one valid value
  return hasValidData ? (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "white",
        padding: 20,
        borderRadius: 5,
        boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
        zIndex: 10,
        width: "auto",
      }}
    >
      <h2>{node.id}</h2>
      <Table columns={columns} dataSource={dataSource} pagination={false} size="small" />
      <Button type="primary" onClick={onClose} style={{ marginTop: "10px" }}>
        Close
      </Button>
    </div>
  ) : null; // Return null if no valid data
};

export default ForceNetworkGraph; 
   


// demy code 
// import React, { useRef, useEffect, useMemo, useState } from "react";
// import { ForceGraph2D } from "react-force-graph";
// import { Table, Button, Modal, Spin } from "antd"; // Added Modal and Spin
// import * as XLSX from "xlsx"; // For Excel export
// import { saveAs } from "file-saver"; // For file saving

// const ForceNetworkGraph = ({ nodes, links }) => {
//   const graphRef = useRef();
//   const [selectedNode, setSelectedNode] = useState(null);
//   const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility

//   // Prepare graph data format for ForceGraph
//   const graphData = useMemo(
//     () => ({
//       nodes: nodes.map((node) => ({
//         id: node.id,
//         group: node.type,
//         class: node.class,
//         Phenotypes: node.Phenotypes,
//         Gene: node.Gene,
//         Name: node.Name,
//         GeneCategory: node.Synonyms,
//         Location: node.Location,
//         Strand: node.Strand,
//         Description: node.Description,
//         OMIM: node.OMIM,
//         Ensembl: node.Ensembl,
//         ClinVar: node.ClinVar,
//         Decipher: node.Decipher,
//         gnomAD: node.gnomAD,
//         PanelApp: node.PanelApp,
//       })),
//       links: links.map((link) => ({
//         source: link.source,
//         target: link.target,
//         DOIs: link.DOIs,
//         group: "link",
//       })),
//     }),
//     [nodes, links]
//   );

//   const getNodeColor = (nodeClass) => {
//     switch (nodeClass) {
//       case "Refractive errors": return "red";
//       case "Retinal diseases": return "blue";
//       case "Others": return "green";
//       case "Lens diseases": return "orange";
//       case "Ocular hypertension": return "purple";
//       case "Ocular motility disorders": return "pink";
//       case "Uveal diseases": return "cyan";
//       case "Corneal diseases": return "magenta";
//       case "Conjunctival diseases": return "lime";
//       case "Orbital diseases": return "teal";
//       case "Eye Neoplasms": return "salmon";
//       case "Lacrimal Apparatus diseases": return "violet";
//       case "Pseudogene": return "brown";
//       case "Genetic Locus": return "darkgreen";
//       case "lncRNA": return "orange";
//       case "miRNA": return "purple";
//       case "mt_tRNA": return "darkblue";
//       case "Other": return "gray";
//       case "Protein coding": return "yellow";
//       case "RNA gene": return "pink";
//       default: return "black";
//     }
//   };

//   const drawNode = (node, ctx) => {
//     const shapeSize = 10;
//     const color = getNodeColor(node.class);
//     ctx.beginPath();
//     ctx.fillStyle = color;

//     if (node.group === "Disease") {
//       ctx.moveTo(node.x, node.y - shapeSize);
//       ctx.lineTo(node.x - shapeSize, node.y + shapeSize);
//       ctx.lineTo(node.x + shapeSize, node.y + shapeSize);
//       ctx.closePath();
//     } else if (node.group === "Gene") {
//       ctx.arc(node.x, node.y, shapeSize, 0, 2 * Math.PI, false);
//     }
//     ctx.fill();
//   };

//   const handleNodeClick = (node) => {
//     console.log(node, "node data here");
//     setSelectedNode(node);
//   };

//   useEffect(() => {
//     if (graphRef.current) {
//       graphRef.current.d3Force("link").distance(150);
//     }
//   }, [graphData]);

//   // Export graphData to Excel
//   const exportToExcel = () => {
//     const workbook = XLSX.utils.book_new();

//     // Nodes sheet
//     const nodesSheet = XLSX.utils.json_to_sheet(graphData.nodes);
//     XLSX.utils.book_append_sheet(workbook, nodesSheet, "Nodes");

//     // Links sheet
//     const linksSheet = XLSX.utils.json_to_sheet(graphData.links);
//     XLSX.utils.book_append_sheet(workbook, linksSheet, "Links");

//     const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
//     const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
//     saveAs(blob, "graph_data.xlsx");
//   };

//   // Take screenshot of the graph
//   const takeScreenshot = () => {
//     const canvas = graphRef.current.d3Force()._canvas; // Access the canvas (might need adjustment)
//     if (canvas) {
//       canvas.toBlob((blob) => {
//         saveAs(blob, "graph_screenshot.png");
//       });
//     } else {
//       console.error("Canvas not found for screenshot");
//     }
//   };

//   return (
//     <div style={{ width: "99%", height: "100vh", overflow: "hidden" }}>
//       <Button
//         type="primary"
//         onClick={() => setIsModalVisible(true)}
//         style={{ position: "absolute", top: 10, left: 10, zIndex: 11 }}
//       >
//         Export Options
//       </Button>
//       <ForceGraph2D
//         ref={graphRef}
//         graphData={graphData}
//         nodeCanvasObject={drawNode}
//         linkWidth={2}
//         backgroundColor="white"
//         nodeRelSize={10}
//         enableZoomInteraction={true}
//         onNodeClick={handleNodeClick}
//         onLinkClick={handleNodeClick}
//         nodeLabel={(node) => `<div style="background-color: black; color: white; padding: 5px; border-radius: 4px;">${node.id}</div>`}
//       />
//       {selectedNode && <DataTable node={selectedNode} onClose={() => setSelectedNode(null)} />}
//       <Modal
//         title="Export Options"
//         visible={isModalVisible}
//         onCancel={() => setIsModalVisible(false)}
//         footer={[
//           <Button key="cancel" onClick={() => setIsModalVisible(false)}>
//             Cancel
//           </Button>,
//           <Button key="excel" type="primary" onClick={exportToExcel}>
//             Export to Excel
//           </Button>,
//           <Button key="screenshot" type="primary" onClick={takeScreenshot}>
//             Take Screenshot
//           </Button>,
//         ]}
//       >
//         <p>Choose an option to export the graph data or capture a screenshot.</p>
//       </Modal>
//     </div>
//   );
// };

// const renderPhenotypes = (text) => {
//   if (!text) return "N/A";
//   if (typeof text !== "string") {
//     console.error("Unexpected data format in Phenotypes:", text);
//     return "Invalid data";
//   }
//   const phenotypeArray = text.split(";");
//   return phenotypeArray.map((item, index) => {
//     const omimMatch = item.match(/OMIM:(\d+)/);
//     if (omimMatch) {
//       const omimId = omimMatch[1];
//       const parts = item.split(`OMIM:${omimId}`);
//       return (
//         <div key={index}>
//           {parts[0]}
//           <a href={`https://omim.org/entry/${omimId}`} target="_blank" rel="noopener noreferrer">
//             OMIM:{omimId}
//           </a>
//           {parts[1]}
//         </div>
//       );
//     }
//     return <div key={index}>{item}</div>;
//   });
// };

// const DataTable = ({ node, onClose }) => {
//   const [imageLoading, setImageLoading] = useState(true); // From previous component

//   const columns = [
//     {
//       title: "Property",
//       dataIndex: "property",
//       key: "property",
//       render: (text) => <div style={{ paddingTop: "1px", paddingBottom: "1px" }}>{text}</div>,
//     },
//     {
//       title: "Value",
//       dataIndex: "value",
//       key: "value",
//       render: (text, record) => {
//         if (["ClinVar", "Decipher", "gnomAD", "PanelApp"].includes(record.property)) {
//           const url = node[record.property];
//           return url ? <a href={url} target="_blank" rel="noopener noreferrer">click here</a> : "N/A";
//         } else if (node.group === "link") {
//           if (text) {
//             const doiList = text.split(";").map((doi, index) => {
//               const trimmedDOI = doi.trim();
//               return (
//                 <div key={index}>
//                   <a href={`https://doi.org/${trimmedDOI}`} target="_blank" rel="noopener noreferrer">
//                     {trimmedDOI}
//                   </a>
//                 </div>
//               );
//             });
//             return doiList.length ? doiList : "N/A";
//           }
//         } else if (record.property === "Phenotypes") {
//           return (
//             <div
//               style={{
//                 maxHeight: "300px",
//                 overflowY: "auto",
//                 border: "1px solid #ddd",
//                 padding: "10px",
//                 borderRadius: "5px",
//                 backgroundColor: "#f9f9f9",
//               }}
//             >
//               {renderPhenotypes(text)}
//             </div>
//           );
//         } else if (["Repurposing_candidate_chembL_ID", "Approved_drug_chembl_ID"].includes(record.property)) {
//           return (
//             <a href={`https://www.ebi.ac.uk/chembl/explore/compound/${text}`} target="_blank" rel="noopener noreferrer">
//               {text}
//             </a>
//           );
//         }
//         return text || "N/A";
//       },
//     },
//   ];

//   let dataSource = [];
//   let imageUrl = null;

//   if (node.group === "Disease") {
//     dataSource = [{ key: "Phenotypes", property: "Phenotypes", value: node.Phenotypes }];
//   } else if (node.group === "link") {
//     dataSource = [{ key: "DOIs", property: "DOIs", value: node.DOIs }];
//   } else if (node.group === "Repurposing Candidate") {
//     dataSource = [
//       { key: "Repurposing_candidate_chembL_ID", property: "Repurposing_candidate_chembL_ID", value: node.Repurposing_candidate_chembL_ID },
//     ];
//     imageUrl = `https://www.ebi.ac.uk/chembl/api/data/image/${node.Repurposing_candidate_chembL_ID}`;
//   } else if (node.group === "Approved Drug") {
//     dataSource = [
//       { key: "Approved_drug_chembl_ID", property: "Approved_drug_chembl_ID", value: node.Approved_drug_chembl_ID },
//     ];
//     imageUrl = `https://www.ebi.ac.uk/chembl/api/data/image/${node.Approved_drug_chembl_ID}`;
//   } else {
//     dataSource = [
//       { key: "Gene", property: "Gene", value: node.Gene },
//       { key: "Name", property: "Name", value: node.Name },
//       { key: "Location", property: "Location", value: node.Location },
//       { key: "Strand", property: "Strand", value: node.Strand },
//       { key: "Description", property: "Description", value: node.Description },
//       { key: "OMIM", property: "OMIM", value: node.OMIM },
//       { key: "Ensembl", property: "Ensembl", value: node.Ensembl },
//       { key: "ClinVar", property: "ClinVar", value: node.ClinVar },
//       { key: "Decipher", property: "Decipher", value: node.Decipher },
//       { key: "gnomAD", property: "gnomAD", value: node.gnomAD },
//       { key: "PanelApp", property: "PanelApp", value: node.PanelApp },
//     ];
//   }

//   const hasValidData = dataSource.some((item) => {
//     const value = item.value;
//     return value !== undefined && value !== "" && value !== null && value !== "N/A";
//   });

//   return hasValidData ? (
//     <div
//       style={{
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         flexDirection: "column",
//         position: "absolute",
//         top: "50%",
//         left: "50%",
//         transform: "translate(-50%, -50%)",
//         backgroundColor: "white",
//         padding: 20,
//         borderRadius: 5,
//         boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
//         zIndex: 10,
//         width: "auto",
//         maxHeight: "300px",
//         overflowY: "auto",
//       }}
//     >
//       <h2>{node.id}</h2>
//       <Table columns={columns} dataSource={dataSource} pagination={false} size="small" />
//       {imageUrl && (
//         <div style={{ marginTop: "10px", textAlign: "center" }}>
//           {imageLoading && <Spin tip="Loading image..." />}
//           <img
//             src={imageUrl}
//             alt={`${node.group} chemical structure`}
//             style={{ maxWidth: "100%", display: imageLoading ? "none" : "block" }}
//             onLoad={() => setImageLoading(false)}
//             onError={(e) => {
//               e.target.style.display = "none";
//               setImageLoading(false);
//             }}
//           />
//         </div>
//       )}
//       <Button type="primary" onClick={onClose} style={{ marginTop: "10px" }}>
//         Close
//       </Button>
//     </div>
//   ) : null;
// };

// export default ForceNetworkGraph;