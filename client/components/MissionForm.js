import React from 'react';
import _ from 'lodash';
import { Alert, Button, Form, FormRow, FormField, FormInput, Table, Spinner } from 'elemental';
import DateInput from './DateInput';
import VolunteerGroupSelect from './VolunteerGroupSelect';
import * as http from '../lib/http';
import formData from '../lib/formData';

export default React.createClass({

   propTypes: {
      mission: React.PropTypes.object.isRequired,
      onChange: React.PropTypes.func,
   },

   contextTypes: {
      volunteers: React.PropTypes.object,
   },

   getDefaultProps() {
      return {
         volunteers: {},
         onChange: _.noop,
      };
   },

   getInitialState() {
      return {
         message: null,
         isSubmitting: false,
         mission: _.cloneDeep(this.props.mission),
      };
   },

   onChange(event) {
      const mission = this.state.mission;
      const target = event.target;

      if (target) {
         mission[target.name] = target.value;
      }
      else {
         mission[event.name] = event.value;
      }

      this.setState({ mission });
   },

   onSubmit(event) {
      event.preventDefault();

      this.setState({ isSubmitting: true });

      const oldMission = this.props.mission;
      const newMission = this.state.mission;
      const values = this.getDiff(oldMission, newMission);

      if (values.crew) {
         values.crew = _.filter(values.crew, a => a.volunteer);
      }

      const body = formData(values);

      http.put(`/api/missions/${oldMission.id}`, { body })
         .then(({ mission }) => {
            this.props.onChange(mission);
         })
         .catch(({ error }) => this.setMessage(error, 'danger'));
   },

   setMessage(text, type) {
      this.setState({ message: { text, type } });
      _.delay(() => this.setState({ message: null }), 3000);
   },

   getDiff(oldObject, newObject) {
      return _.transform(newObject, (result, value, key) => {
         if (_.isEqual(oldObject[key], value)) return;
         result[key] = value;
      }, {});
   },

   renderCrew(mission) {
      const crew = mission.crew;

      if (_.isEmpty(crew)) return null;

      const onChange = oldVolunteerID => newVolunteerID => {
         const assignment = _.find(mission.crew, a => a.volunteer === oldVolunteerID);
         assignment.status = 'none';
         assignment.volunteer = newVolunteerID;
         this.setState({ mission });
      };

      const onRemove = volunteerID => () => {
         _.remove(crew, n => n.volunteer === volunteerID);
         this.setState({ mission });
      };

      const addMember = () => {
         crew.push({ status: 'none', volunteer: _.uniqueId() });
         this.setState({ mission });
      };

      return (
         <Table style={{ tableLayout: 'fixed' }}>
            <thead>
               <tr>
                  <th>Status</th><th>Group</th><th>Name (Einsätze)</th>
                  <th style={{ paddingBottom: 0 }}>
                     <Button type="link" onClick={addMember}>Add Crew Member</Button>
                  </th>
               </tr>
            </thead>
            <tbody>
               {_.map(crew, assignment =>
                  <VolunteerGroupSelect
                     key={assignment.volunteer}
                     assignment={assignment}
                     onChange={onChange(assignment.volunteer)}
                     onRemove={onRemove(assignment.volunteer)}
                  />
               )}
            </tbody>
         </Table>
      );
   },

   render() {
      const mission = this.state.mission;

      return (
         <div>
            {this.state.message &&
               <Alert type={this.state.message.type}>{this.state.message.text}</Alert>
            }

            <Form onChange={this.onChange} onSubmit={this.onSubmit}>

               <FormField label="Name">
                  <FormInput name="name" type="text" defaultValue={mission.name} required />
               </FormField>

               {/* TODO: Load areas and set area */}

               <FormRow>
                  <FormField label="Start" width="one-half">
                     <DateInput
                        name="start"
                        required
                        defaultValue={mission.start}
                        onChange={value => this.onChange({ name: 'start', value })}
                     />
                  </FormField>
                  <FormField label="End" width="one-half">
                     <DateInput
                        name="end"
                        required
                        defaultValue={mission.end}
                        onChange={value => this.onChange({ name: 'end', value })}
                     />
                  </FormField>
               </FormRow>

               {this.renderCrew(mission)}

               <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <Button type="primary" submit style={{ padding: '0 2rem' }}>
                     Save Data and Notify Crew {this.state.isSubmitting && <Spinner type="inverted" />}
                  </Button>
               </div>
            </Form>
         </div>
      );
   },

});
