import React, { useState } from 'react';
import { Box, Container, Tabs, Tab, Typography, Button } from '@mui/material';
import { HandyTreeView, HandyTreeViewApiRef, TreeViewItem } from '../src/components/HandyTreeView';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dev-tabpanel-${index}`}
      aria-labelledby={`dev-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `dev-tab-${index}`,
    'aria-controls': `dev-tabpanel-${index}`,
  };
}

const App: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // Example 1: Basic Static Tree
  const basicItems: TreeViewItem[] = [
    {
      id: '1',
      label: 'Documents',
      children: [
        { id: '1-1', label: 'file1.txt' },
        { id: '1-2', label: 'file2.txt' },
      ],
    },
    {
      id: '2',
      label: 'Pictures',
      children: [
        { id: '2-1', label: 'photo1.jpg' },
        { id: '2-2', label: 'photo2.jpg' },
      ],
    },
  ];

  // Example 2: Controlled Expansion
  const [expandedItems, setExpandedItems] = useState<string[]>(['1']);

  // Example 3: Multi-Selection
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Example 4: API Ref
  const apiRef: HandyTreeViewApiRef = { current: undefined };

  const handleFocusFirst = () => {
    apiRef.current?.focusItem?.('1');
  };

  const handleExpandAll = () => {
    basicItems.forEach((item) => {
      if (item.children && item.children.length > 0) {
        apiRef.current?.setItemExpansion?.(item.id, true);
      }
    });
  };

  const handleCollapseAll = () => {
    basicItems.forEach((item) => {
      if (item.children && item.children.length > 0) {
        apiRef.current?.setItemExpansion?.(item.id, false);
      }
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        HandyTreeView - Development Server
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Interactive examples and development playground
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={value} onChange={handleChange} aria-label="example tabs">
          <Tab label="Basic Tree" {...a11yProps(0)} />
          <Tab label="Controlled Expansion" {...a11yProps(1)} />
          <Tab label="Multi-Selection" {...a11yProps(2)} />
          <Tab label="API Ref" {...a11yProps(3)} />
          <Tab label="Custom Rendering" {...a11yProps(4)} />
          <Tab label="Disabled Items" {...a11yProps(5)} />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        <Typography variant="h6" gutterBottom>
          Basic Static Tree
        </Typography>
        <HandyTreeView items={basicItems} />
      </TabPanel>

      <TabPanel value={value} index={1}>
        <Typography variant="h6" gutterBottom>
          Controlled Expansion
        </Typography>
        <HandyTreeView
          items={basicItems}
          expandedItems={expandedItems}
          onExpandedItemsChange={(event, itemIds) => {
            setExpandedItems(itemIds as string[]);
          }}
        />
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            Expanded: {expandedItems.length > 0 ? expandedItems.join(', ') : 'None'}
          </Typography>
        </Box>
      </TabPanel>

      <TabPanel value={value} index={2}>
        <Typography variant="h6" gutterBottom>
          Multi-Selection with Checkboxes
        </Typography>
        <HandyTreeView
          items={basicItems}
          multiSelect
          checkboxSelection
          selectedItems={selectedItems}
          onSelectedItemsChange={(event, itemIds) => {
            setSelectedItems(itemIds as string[]);
          }}
        />
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            Selected: {selectedItems.length > 0 ? selectedItems.join(', ') : 'None'}
          </Typography>
        </Box>
      </TabPanel>

      <TabPanel value={value} index={3}>
        <Typography variant="h6" gutterBottom>
          Using API Ref
        </Typography>
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" size="small" onClick={handleFocusFirst}>
            Focus First Item
          </Button>
          <Button variant="outlined" size="small" onClick={handleExpandAll}>
            Expand All
          </Button>
          <Button variant="outlined" size="small" onClick={handleCollapseAll}>
            Collapse All
          </Button>
        </Box>
        <HandyTreeView items={basicItems} apiRef={apiRef} />
      </TabPanel>

      <TabPanel value={value} index={4}>
        <Typography variant="h6" gutterBottom>
          Custom Item Rendering
        </Typography>
        <HandyTreeView
          items={basicItems}
          getItemLabel={(item) => {
            const hasChildren = item.children && item.children.length > 0;
            return hasChildren ? `📁 ${item.label}` : `📄 ${item.label}`;
          }}
        />
      </TabPanel>

      <TabPanel value={value} index={5}>
        <Typography variant="h6" gutterBottom>
          Disabled Items
        </Typography>
        <HandyTreeView
          items={basicItems}
          isItemDisabled={(itemId) => itemId === '2'}
        />
      </TabPanel>
    </Container>
  );
};

export default App;
