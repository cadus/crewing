import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Alert, Button, Form, FormRow, FormField, FormInput, Table, Spinner } from 'elemental';
import Select from 'react-select';
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
         .then(({ mission }) => this.props.onChange(mission))
         .catch(({ error }) => this.setMessage(error, 'danger'));
   },

   onCancel() {
      this.props.onChange(this.props.mission);
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

      const addMember = () => {
         crew.push({ status: 'none', volunteer: _.uniqueId() });
         this.setState({ mission });
      };

      const changeMember = oldVolunteerID => newVolunteerID => {
         const assignment = _.find(mission.crew, a => a.volunteer === oldVolunteerID);
         assignment.status = 'none';
         assignment.volunteer = newVolunteerID;
         this.setState({ mission });
      };

      const removeMember = volunteerID => () => {
         _.remove(crew, n => n.volunteer === volunteerID);
         this.setState({ mission }, (crew.length ? _.noop : addMember));
      };

      return (
         <Table style={{ tableLayout: 'fixed', marginBottom: '1rem' }}>
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
                     mission={this.state.mission}
                     onChange={changeMember(assignment.volunteer)}
                     onRemove={removeMember(assignment.volunteer)}
                  />
               )}
            </tbody>
         </Table>
      );
   },

   render() {
      const mission = this.state.mission;
      const getOption = v => ({ value: v.id, label: `${v.name.first || ''} ${v.name.last || ''}` });
      const currentVolunteers = mission.crew
         .map(a => this.context.volunteers[a.volunteer])
         .filter(Boolean) // remove unfinished selections
         .map(getOption);

      const start = moment(mission.start);
      const end = moment(mission.end);

      return (
         <div>
            {this.state.message &&
               <Alert type={this.state.message.type}>{this.state.message.text}</Alert>
            }

            <div style={{ textAlign: 'right' }}>
               <a href={`/availabilities?start=${+new Date(mission.start)}&end=${+new Date(mission.end)}`} target="_blank">Availabilities</a>
            </div>

            <Form onChange={this.onChange} onSubmit={this.onSubmit}>

               <FormField label="Name">
                  <FormInput name="name" type="text" defaultValue={mission.name} required />
               </FormField>

               {/* TODO: Load areas and set area */}

               <FormRow>
                  <FormField label="Start" width="one-half">
                     <DateInput
                        required
                        selectsStart
                        startDate={start}
                        endDate={end}
                        defaultValue={start}
                        onChange={value => this.onChange({ name: 'start', value })}
                     />
                  </FormField>
                  <FormField label="End" width="one-half">
                     <DateInput
                        required
                        selectsEnd
                        startDate={start}
                        endDate={end}
                        defaultValue={end}
                        onChange={value => this.onChange({ name: 'end', value })}
                     />
                  </FormField>
               </FormRow>

               {this.renderCrew(mission)}

               <FormRow>
                  <FormField label="Head of Mission" width="one-half">
                     <Select
                        options={currentVolunteers}
                        value={mission.headOfMission}
                        onChange={({ value }) => this.onChange({ name: 'headOfMission', value })}
                        clearable={false}
                        backspaceRemoves={false}
                        deleteRemoves={false}
                     />
                  </FormField>
               </FormRow>

               <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <Button type="link" onClick={this.onCancel}>Cancel</Button>
                  <Button type="primary" submit>
                     Save Data and Notify Crew {this.state.isSubmitting && <Spinner type="inverted" />}
                  </Button>
               </div>
            </Form>
         </div>
      );
   },

});
