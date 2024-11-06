  import React, { useRef, useEffect, useMemo, useState } from 'react';
  import { ForceGraph2D } from 'react-force-graph';
  import { Table, Button } from 'antd'; // Ant Design components

  const ForceNetworkGraph = ({ nodes, links }) => {
    const graphRef = useRef();
    const [selectedNode, setSelectedNode] = useState(null); // State to manage selected node

    // Prepare graph data format for ForceGraph
    const graphData = useMemo(() => ({
      nodes: nodes.map(node => ({
        id: node.id,
        group: node.type,
        class: node.class,

      })),
      links: links.map(link => ({ source: link.source, target: link.target })),
    }), [nodes, links]);

    // Function to draw different node shapes based on the group and class
   const getNodeColor = (nodeClass) => {
  switch (nodeClass) {
    case 'Refractive errors':
      return 'red';
    case 'Retinal diseases':
      return 'blue';
    case 'Others':
      return 'green';
    case 'Lens diseases':
      return 'orange';
    case 'Ocular hypertension':
      return 'purple';
    case 'Ocular motility disorders':
      return 'pink';
    case 'Uveal diseases':
      return 'cyan';
    case 'Corneal diseases':
      return 'magenta';
    case 'Conjunctival diseases':
      return 'lime';
    case 'Orbital diseases':
      return 'teal';
    case 'Eye Neoplasms':
      return 'salmon';
    case 'Lacrimal Apparatus diseases':
      return 'violet';
    case 'Pseudogene':
      return 'brown';
    case 'Genetic Locus':
      return 'darkgreen';
    case 'lncRNA':
      return 'orange';
    case 'miRNA':
      return 'purple';
    case 'mt_tRNA':
      return 'darkblue';
    case 'Other':
      return 'gray';
    case 'Protein coding':
      return 'yellow';
    case 'RNA gene':
      return 'pink';
    default:
      return 'black'; // Default color if class not found
  }
};

const drawNode = (node, ctx) => {
  const shapeSize = 10;
  const color = getNodeColor(node.class); // Get color based on class
  ctx.beginPath();
  ctx.fillStyle = color;

  if (node.group === 'Disease') {
    // Draw triangle for 'Disease'
    ctx.moveTo(node.x, node.y - shapeSize);
    ctx.lineTo(node.x - shapeSize, node.y + shapeSize);
    ctx.lineTo(node.x + shapeSize, node.y + shapeSize);
    ctx.closePath();
  } else if (node.group === 'Gene') {
    // Draw circle for 'Gene'
    ctx.arc(node.x, node.y, shapeSize, 0, 2 * Math.PI, false);
  }

  ctx.fill();

  // Optional: Add node ID label next to each node
  ctx.fillStyle = 'black';
  ctx.font = '10px Arial';
  ctx.fillText(node.id, node.x + shapeSize + 5, node.y);
};
    

    // Handle node click to set selected node
    const handleNodeClick = (node) => {
      console.log(node, "node data here")
      setSelectedNode(node); // Set the selected node for table
    };

    // Set link distance and other forces
    useEffect(() => {
      if (graphRef.current) {
        graphRef.current.d3Force('link').distance(150); // Set link distance
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
          nodeLabel={(node) => {
            return `<div style="background-color: black; color: white; padding: 5px; border-radius: 4px;">${node.id}</div>`;
          }}
        />
        {selectedNode && <DataTable node={selectedNode} onClose={() => setSelectedNode(null)} />}
      </div>
    );
  };

  // DataTable component to display node details

  const DataTable = ({ node, onClose }) => {
    console.log(node);
  
    // Define the columns for the Ant Design table
    const columns = [
      { 
        title: 'Property', 
        dataIndex: 'property', 
        key: 'property',
        render: (text) => text.replace(/_/g, ' ') // Replace underscores with spaces
      },
      { 
        title: 'Value', 
        dataIndex: 'value', 
        key: 'value', 
        render: (text, record) => {
          console.log(record, "record");
          if (['EFO_Ids_Mondo'].includes(record.property)) {
            return <a href={`https://monarchinitiative.org/${text}`} target="_blank" rel="noopener noreferrer">{text}</a>;
          }
          else if (['ORPHanet_ID', 'Mode_of_inheritance', 'Repurposing_candidate_chembL_ID', 'Approved_drug_chembl_ID'].includes(record.property)){
            const id = text.split(":")[1];
            return <a href={`https://www.orpha.net/en/disease/detail/${id}?name=Orphanet:782${text}`} target="_blank" rel="noopener noreferrer">{text}</a>;
          }
          return text;
        }
      },
    ];
  
    // Conditionally add data based on the node.group value
    let dataSource = [];
  
    if (node.group === "KNOWN GENE") {
      dataSource = [
        { key: 'Mode_of_inheritance', property: 'Mode_of_inheritance', value: node.Mode_of_inheritance },
      ];
    } else if (node.group === "Repurposing Candidate") {
      dataSource = [
        { key: 'Repurposing_candidate_chembL_ID', property: 'Repurposing_candidate_chembL_ID', value: node.Repurposing_candidate_chembL_ID },
      ];
    } else if (node.group === "Approved Drug") {
      dataSource = [
        { key: 'Approved_drug_chembl_ID', property: 'Approved_drug_chembl_ID', value: node.Approved_drug_chembl_ID },
      ];
    } else {
      // Default properties if no specific group matches
      dataSource = [
        { key: 'EFO_Ids_Mondo', property: 'EFO_Ids_Mondo', value: node.EFO_Ids_Mondo },
        { key: 'ORPHanet_ID', property: 'ORPHanet_ID', value: node.ORPHanet_ID },
        { key: 'EYE_FINDING', property: 'EYE_FINDING', value: node.EYE_FINDING },
      ];
    }
  
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 5,
        boxShadow: '0px 0px 10px rgba(0,0,0,0.2)',
        zIndex: 10,
        width: 400
      }}>
        <h2>{node.id}</h2>
        <Table columns={columns} dataSource={dataSource} pagination={false} />
        <Button type="primary" onClick={onClose} style={{ marginTop: '10px' }}>Close</Button>
      </div>
    );
  };
  

  export default ForceNetworkGraph;
