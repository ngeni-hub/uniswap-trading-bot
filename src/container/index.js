import { AppBar, Box, Container, Tab, Tabs, Typography, useTheme } from '@material-ui/core';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { botState } from './../utils/index';
import Bot from './bot';
import Settings from './settings';
import Trade from './trade';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function MainContent() {

  const [value, setValue] = React.useState(0);

  const theme = useTheme();

  const botStarted = useRecoilValue(botState);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };


  return (
    <>
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          onChange={handleChange}
          aria-label="disabled tabs example"
        >
          <Tab label="Trading Bot" />
          <Tab label="Trade" disabled={botStarted} />
          <Tab label="Settings" disabled={botStarted} />
        </Tabs>
      </AppBar>
      <Container>
        <TabPanel value={value} index={0} dir={theme.direction}>
          <Bot />
        </TabPanel>
        <TabPanel value={value} index={1} dir={theme.direction}>
          <Trade />
        </TabPanel>
        <TabPanel value={value} index={2} dir={theme.direction}>
          <Settings />
        </TabPanel>
      </Container>
    </>
  );
}

export default MainContent;