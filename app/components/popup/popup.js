import React, { Component } from 'react'
import SwipeableViews from "react-swipeable-views";
import ExtensionCard from "./extension-card";
import Button from "@material-ui/core/Button";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import {
  Grid,
  Typography,
  Switch,
  TextField,
} from "@material-ui/core";

import { withStyles, withTheme } from '@material-ui/styles';
import TabPanel from './tab-panel';


const styles = theme => ({
  root: {
    flexGrow: 1,
    width: 400,
    height: 570
  },
  lowerCase: {
    textTransform: "none",
    fontSize: 13,
    height: 45
  },
  extensionHolder: {
    height: 460,
    flexGrow: 1,
    overflow: "auto"
  },
  extensionHolderParent:{
    padding: 0
  },
  expansionPanel: {
    padding: 3
  }
});

class Popup extends Component {

  constructor() {
    super();

    this.background = chrome.extension.getBackgroundPage().backgroundPage

    this.state = {
      tabPanelIndex: 0,
      extensions: [],
      reloadAllDevExtensionsOnBuild: false,
      reloadAllTabsOnBuild: false,
      port: ''
    }
  }

  componentDidMount(){
    chrome.storage.local.get(['reloadAllDevExtensionsOnBuild', 'reloadAllTabsOnBuild', 'port'], (result) => {
      this.setState({
        reloadAllDevExtensionsOnBuild: result.reloadAllDevExtensionsOnBuild,
        reloadAllTabsOnBuild: result.reloadAllTabsOnBuild,
        port: result.port ? result.port : 8890
      })
    });
    this.refreshExtensions()
  }

  setPropertyInStorage(key, value) {
    chrome.storage.local.set({ [key]: value }, () => {
      this.setState({ [key]: value })
    })
  }

  refreshExtensions(){
    this.background.getAllExtensions()
      .then((extensions) => { this.setState({ extensions }) })
      .catch((ex) => console.log(ex))
  }

  render() {
    const { classes } = this.props;
    const theme = { direction: null }

    return (
      <div className={classes.root}>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              className={classes.lowerCase}
              onClick={() => { this.background.reloadAllDevExtensions() }}
            >
              Reload All Dev Extensions
              </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              className={classes.lowerCase}
              onClick={() => { this.background.reloadAllOpenTabs() }}
            >
              Reload All Tabs
              </Button>
          </Grid>
          <Grid item xs={12}>
            <AppBar position="static" color="default">
              <Tabs
                value={this.state.tabPanelIndex}
                onChange={(_, newValue) => { this.setState({ tabPanelIndex: newValue }) }}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
              >
                <Tab label="Settings" className={classes.lowerCase} />
                <Tab label="Extensions" className={classes.lowerCase} />
              </Tabs>
            </AppBar>
            <SwipeableViews
              axis={theme.direction === "rtl" ? "x-reverse" : "x"}
              index={this.state.tabPanelIndex}
              onChangeIndex={(index) => { this.setState({ tabPanelIndex: index }) }}
            >
              <TabPanel value={this.state.tabPanelIndex} index={0} dir={theme.direction}>
                <Grid container>
                  <Grid container justify="space-between">
                    <Typography component="label">
                      {" "}
                      Reload all dev extensions on build
                      </Typography>
                    <Switch checked={this.state.reloadAllDevExtensionsOnBuild} onChange={(_, checked) => {this.setPropertyInStorage("reloadAllDevExtensionsOnBuild", checked)}} color="primary" />
                  </Grid>
                  <Grid container justify="space-between">
                    <Typography component="label">
                      {" "}
                      Reload all open tabs on build
                      </Typography>
                    <Switch checked={this.state.reloadAllTabsOnBuild} onChange={(_, checked) => {this.setPropertyInStorage("reloadAllTabsOnBuild", checked)}} color="primary" />
                  </Grid>
                  <Grid container justify="space-between">
                    <Typography component="label">Port</Typography>
                    <TextField type="number" value={this.state.port} hiddenLabel onChange={(event)=>{this.setPropertyInStorage("port", event.target.value)}}/>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={this.state.tabPanelIndex} index={1} dir={theme.direction}>
                {/* <Grid item>
                    <ExpansionPanel expanded>
                      <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                        <Typography>All</Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails className={classes.expansionPanel}>
                        
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                  </Grid> */}

                <Grid item className={classes.extensionHolder}>
                  {this.state.extensions.map((extension) => 
                  <ExtensionCard 
                    extension={extension}
                    background={this.background}
                    />
                  )}
                </Grid>
              </TabPanel>
            </SwipeableViews>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default (withStyles(styles)(withTheme(Popup)))