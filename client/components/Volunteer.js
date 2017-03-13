import React from 'react';
import _ from 'lodash';
import { Card, Alert, ButtonGroup, Button, Spinner } from 'elemental';
import VolunteerForm from './VolunteerForm';
import LoginLinkForm from './LoginLinkForm';
import Missions from './Missions';
import * as http from '../lib/http';

export default React.createClass({

   getInitialState() {
      return {
         volunteer: null,
         missions: null,
         isEditing: false,
         error: null,
         message: null,
         hasVisitedBefore: !!window.localStorage.getItem('hasVisitedBefore'),
      };
   },

   componentDidMount() {
      if (!this.state.hasVisitedBefore) {
         window.localStorage.setItem('hasVisitedBefore', true);
      }

      http.get('/api/volunteer')
         .then(({ volunteer, missions }) => this.setState({ volunteer, missions }))
         .catch(({ error }) => this.setState({ error }));
   },

   setMessage(message) {
      this.setState({ message });
      _.delay(() => this.setState({ message: null }), 3000);
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
         return <LoginLinkForm />;
      }

      return (
         <div className="container">
            <header>
               <Card style={{ overflow: 'hidden' }}>
                  <img src="/images/logo.svg" height="32" alt="cadus crewing" style={{ marginTop: -10 }} />
                  <ButtonGroup style={{ float: 'right' }}>
                     <Button type="link" size="sm" onClick={this.toggleEditMode}>Change Data</Button>
                     <small style={{ paddingLeft: 14 }}>{this.state.volunteer.name.first}</small>
                  </ButtonGroup>
               </Card>
            </header>
            {this.state.message &&
               <Alert type="success">{this.state.message}</Alert>
            }
            {!this.state.hasVisitedBefore && !this.state.isEditing &&
               <Alert type="info"><strong>Welcome!</strong> To edit your personal information, click on “<strong>Change Data</strong>” ↗</Alert>
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
