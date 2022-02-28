import React, { useContext, useEffect } from 'react';
import { Button, TextField, Grid, Container, Paper } from '@material-ui/core';
import { Phone, PhoneDisabled } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

import { SocketContext } from '../Context';


const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  gridContainer: {
    width: '100%',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
  container: {
    width: '600px',
    margin: '20px 0',
    padding: 0,
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  margin: {
    marginTop: 10,
  },
  padding: {
    padding: 5,
  },
  paper: {
    padding: '10px 10px',
    border: '2px solid black',
  },
}));

const Sidebar = ({ children }) => {
  const { callAccepted, name, setName, callEnded, leaveCall, callMedic,  stopHubConnection} = useContext(SocketContext);
  const classes = useStyles();

 

  useEffect(() => {
    console.log("Context----> am intrat in use efects la siderbar me");

    return () => { //asta se apeleaza cand se iese din componenta
        stopHubConnection();
    }
  }, [] ); 


  return (
    <Container id='luci0' className={classes.container}>
      <Paper id='paper' elevation={10} className={classes.paper}>
        <form className={classes.root} noValidate autoComplete="off">
          <Grid id='luci1' container  >
          <Grid id='luci2' item xs={6} md={6} className={classes.padding}>
              {/* <Typography gutterBottom variant="h9">My name</Typography> */}
              <TextField label="Introduceti numele:" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={6} md={6} className={classes.padding}>
              {callAccepted && !callEnded ? (
                <Button variant="contained" color="secondary" startIcon={<PhoneDisabled fontSize="large" />} fullWidth onClick={leaveCall} className={classes.margin}>
                 Stop!
                </Button>
              ) :  (
                <Button variant="contained" color="primary" startIcon={<Phone fontSize="large" />} fullWidth className={classes.margin} visible={name}
                        onClick={() => callMedic() } >
                  Suna Medicul !
                </Button>
              )}
            </Grid>
          </Grid>
        </form>
        {children}
      </Paper>
    </Container>
  );
};

export default Sidebar;
