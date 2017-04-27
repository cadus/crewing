import React from 'react';
import _ from 'lodash';
import { Card, Alert, Spinner } from 'elemental';
import Mission from './Mission';
import * as http from '../lib/http';

export default React.createClass({

   childContextTypes: {
      missions: React.PropTypes.array,
      volunteers: React.PropTypes.object,
      assignments: React.PropTypes.object,
   },

   getInitialState() {
      return {
         missions: null,
         volunteers: null,
         error: null,
         message: null,
      };
   },

   getChildContext() {
      return {
         missions: this.state.missions,
         volunteers: this.state.volunteers,
         assignments: this.state.assignments,
      };
   },

   componentDidMount() {
      Promise.all([
         http.get('/api/missions'),
         http.get('/api/volunteers'),
      ])
         .then(([{ missions }, { volunteers }]) => {
            const mappedVolunteers = _.keyBy(volunteers, 'id');
            this.setState({ missions, volunteers: mappedVolunteers }, this.setAssignments);
         })
         .catch(console.error);
   },

   setAssignments() {
      const assignments = {};
      _.each(this.state.missions, mission =>
         _.each(mission.crew, a => assignments[a.volunteer] = (assignments[a.volunteer] || 0) + 1));
      this.setState({ assignments });
   },

   setMessage(message) {
      this.setState({ message });
      _.delay(() => this.setState({ message: null }), 3000);
   },

   updateMission(newMission) {
      const missions = this.state.missions;
      const index = _.findIndex(missions, mission => mission.id === newMission.id);
      missions[index] = newMission;
      this.setState({ missions });
   },

   render() {
      if (this.state.error) {
         return (
            <div className="container" style={{ marginTop: 100 }}>
               <Alert type="danger"><strong>Error:</strong> {this.state.error}</Alert>
            </div>
         );
      }

      if (this.state.missions === null) {
         return <div style={{ marginTop: 100, textAlign: 'center' }}><Spinner size="lg" /></div>;
      }

      return (
         <div className="container">
            <header>
               <Card style={{ overflow: 'hidden' }}>
                  <img src="/images/logo.svg" height="32" alt="cadus crewing" style={{ marginTop: -10 }} />
               </Card>
            </header>
            {this.state.message &&
               <Alert type="success">{this.state.message}</Alert>
            }
            {_.map(this.state.missions, mission =>
               <Mission
                  isEditable
                  key={mission.id}
                  mission={mission}
                  onChange={this.updateMission}
               />
            )}
         </div>
      );
   },

});
