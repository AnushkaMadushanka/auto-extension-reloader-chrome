import React, { Component } from "react";
import Card from "@material-ui/core/Card";
import {
  CardHeader,
  Avatar,
  CardActions,
  IconButton,
  Grid,
  Switch
} from "@material-ui/core";
import { red } from "@material-ui/core/colors";
import { Cached, Delete, Favorite } from "@material-ui/icons";
import { withStyles } from "@material-ui/styles";

const styles = theme => ({
  card: {
    flexGrow: 1,
    marginBottom: 10,
    marginRight: 5
  },
  avatar: {
    backgroundColor: red[500]
  }
});

class ExtensionCard extends Component {

  constructor(props) {
    super(props)
    this.background = props.background
    this.state = {
      enabled: props.extension.enabled
    }

    this.setExtensionState = this.setExtensionState.bind(this)
    this.uninstallExtension = this.uninstallExtension.bind(this)
    this.reloadExtension = this.reloadExtension.bind(this)
  }

  componentDidMount(){
    console.log(this.props.extension);
  }

  reloadExtension() {
    this.background.reloadExtensionUsingId(this.props.extension.id)
  }

  uninstallExtension() {
    window.chrome.management.uninstall(this.props.extension.id, {showConfirmDialog: true}, () => {
      const lastError = window.chrome.runtime.lastError
      console.log(lastError)
    })
  }

  async setExtensionState(_, checked){
    await this.background.setExtensionState(this.props.extension.id, checked)
    this.setState({enabled: checked})
  }

  render(){
    const { extension, classes } = this.props 

    return (
      <Card className={classes.card}>
        <Grid container justify="space-between">
          <CardHeader
            avatar={extension.icons 
              ? <Avatar src={extension.icons.sort((a,b)=>b.size - a.size)[0].url} />
              : <Avatar className={classes.avatar}>{extension.name[0].toUpperCase()}</Avatar>}
            title={extension.name}
            subheader={`ID: ${extension.id}`}
          />
          <CardActions className={classes.cardActions} disableSpacing>
            <Switch checked={this.state.enabled} onChange={this.setExtensionState} color="primary" />
            <IconButton onClick={this.reloadExtension}>
              <Cached />
            </IconButton>
            <IconButton onClick={this.uninstallExtension}>
              <Delete />
            </IconButton>
          </CardActions>
        </Grid>
      </Card>
    );
  }
}

export default (withStyles(styles)(ExtensionCard))
