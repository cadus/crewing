import React from 'react';
import _ from 'lodash';
import { Button, Pill } from 'elemental';
import Select from 'react-select';
import groupsJSON from '../../shared/groups.json';

const groups = groupsJSON.map(name => ({ value: name, label: _.startCase(name) }));
const statusMap = {
   none: 'default',
   pending: 'info',
   yes: 'success',
   no: 'danger',
};

export default React.createClass({

   propTypes: {
      assignment: React.PropTypes.object.isRequired,
      mission: React.PropTypes.object.isRequired,
      onChange: React.PropTypes.func,
      onRemove: React.PropTypes.func,
   },

   contextTypes: {
      volunteers: React.PropTypes.object,
      assignments: React.PropTypes.object,
   },

   getDefaultProps() {
      return {
         volunteers: {},
         onChange: _.noop,
         onRemove: _.noop,
      };
   },

   getInitialState() {
      const group = (this.context.volunteers[this.props.assignment.volunteer] || {}).group;
      return { group };
   },

   componentDidMount() {
      this.setSuitableVolunteers();
   },

   componentWillReceiveProps(nextProps) {
      this.setSuitableVolunteers(nextProps.mission);
   },

   setSuitableVolunteers(mission = this.props.mission) {
      const group = this.state.group;
      const now = new Date();
      const start = new Date(mission.start);
      const end = new Date(mission.end);

      const isAvailable = av => (
         new Date(av.confirmationTill || now) >= now &&
         new Date(av.from) <= start &&
         new Date(av.till) >= end
      );

      const volunteers = _.filter(this.context.volunteers, volunteer =>
         group === volunteer.group &&
         volunteer.availabilities.length &&
         volunteer.availabilities.find(isAvailable));

      this.setState({ volunteers });
   },

   changeGroup({ value }) {
      this.setState({ group: value }, this.setSuitableVolunteers);
   },

   changeName({ value }) {
      this.props.onChange(value);
   },

   remove() {
      this.props.onRemove(this.props.assignment.volunteer);
   },

   render() {
      const assignment = this.props.assignment;
      const group = this.state.group;
      const getName = v => `${v.name.first || ''} ${v.name.last || ''}`.trim();
      const volunteers = _.map(this.state.volunteers, v => ({ value: v.id, label: getName(v) }));

      const assignments = this.context.assignments;
      const volunteerList = ({ value, label }) => (
         <div>
            {label}
            <span style={{ float: 'right' }}>{assignments[value] ? `(${assignments[value]})` : ''}</span>
         </div>
      );


      return (
         <tr key={assignment.volunteer}>
            <td>
               <Pill label={assignment.status} type={statusMap[assignment.status]} />
            </td>
            <td>
               <Select
                  name="group"
                  options={groups}
                  value={group}
                  onChange={this.changeGroup}
                  clearable={false}
                  backspaceRemoves={false}
                  deleteRemoves={false}
               />
            </td>
            <td>
               <Select
                  name="volunteer"
                  options={volunteers}
                  value={assignment.volunteer}
                  optionRenderer={volunteerList}
                  onChange={this.changeName}
                  clearable={false}
                  backspaceRemoves={false}
                  deleteRemoves={false}
               />
            </td>
            <td>
               <Button type="default" onClick={this.remove}>Remove</Button>
            </td>
         </tr>
      );
   },

});
