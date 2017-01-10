import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { Card, Alert, ButtonGroup, Button, Spinner } from 'elemental';
import VolunteerForm from '../components/VolunteerForm';
import Missions from '../components/Missions';
import * as http from '../lib/http';

const App = React.createClass({

   getInitialState() {
      return {
         volunteer: null,
         missions: null,
         isEditing: false,
         error: null,
         message: null,
      };
   },

   componentDidMount() {
      http.get('/api/volunteer')
         .then(({ volunteer, missions }) => this.setState({ volunteer, missions }))
         .catch(({ error }) => this.setState({ error }));
   },

   setMessage(message) {
      this.setState({ message });
      _.delay(() => this.setState({ message: null }), 3000);
   },

   changeToken() {
      http.put('/api/volunteer/token')
         .then(() => this.setMessage('Token changed'));
   },

   toggleEditMode() {
      this.setState({ isEditing: !this.state.isEditing });
   },

   render() {
      if (this.state.error) {
         return (
            <div className="container" style={{ marginTop: 100 }}>
               <Alert type="danger"><strong>Error:</strong> {this.state.error}</Alert>
            </div>
         );
      }

      if (this.state.volunteer === null) {
         return <div style={{ marginTop: 100, textAlign: 'center' }}><Spinner size="lg" /></div>;
      }

      if (_.isEmpty(this.state.volunteer)) {
         return <h1>Couldn't find data.</h1>;
      }

      return (
         <div className="container">
            <header>
               <Card style={{ overflow: 'hidden' }}>
                  <img src="/images/logo.svg" height="32" alt="cadus crewing" style={{ marginTop: -10 }} />
                  <ButtonGroup style={{ float: 'right' }}>
                     <Button type="link" size="sm" onClick={this.toggleEditMode}>Change Data</Button>
                     <Button type="link" size="sm" onClick={this.changeToken}>Change Token</Button>
                     <small style={{ paddingLeft: 14 }}>{this.state.volunteer.name.first}</small>
                  </ButtonGroup>
               </Card>
            </header>
            {this.state.message &&
               <Alert type="success">{this.state.message}</Alert>
            }
            <Card>
               {this.state.isEditing
                  ? <VolunteerForm volunteer={this.state.volunteer} />
                  : <Missions missions={this.state.missions} />
               }
            </Card>
         </div>
      );
   },

});

ReactDOM.render(<App {...window.data} />, document.getElementById('app'));
