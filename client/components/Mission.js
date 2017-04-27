import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import { Card, Table, Button, Pill } from 'elemental';
import { Map, TileLayer } from 'react-leaflet';
import MissionForm from './MissionForm';

const formatDate = date => moment(date).format(moment.localeData().longDateFormat('L'));

const statusMap = {
   none: 'default',
   pending: 'info',
   yes: 'success',
   no: 'danger',
};

export default React.createClass({

   propTypes: {
      mission: React.PropTypes.object.isRequired,
      isEditable: React.PropTypes.bool,
      onChange: React.PropTypes.func,
   },

   contextTypes: {
      volunteers: React.PropTypes.object,
   },

   getDefaultProps() {
      return {
         isEditable: false,
         onChange: _.noop,
      };
   },

   getInitialState() {
      // coordinates come in in wrong order, so we have to reverse them
      const position = _.has(this.props.mission, 'area.location.geo')
         ? this.props.mission.area.location.geo.slice().reverse()
         : null;

      return {
         position,
         zoom: 10,
         isEditing: false,
      };
   },

   componentDidMount() {
      // if address is missing, load if from open street map
      if (!this.state.position && this.props.mission.area) {
         const location = this.props.mission.area.location;
         const fields = ['country', 'postcode', 'state', 'street1'];
         const query = _.map(_.pick(location, fields), part => part ? part.replace(/\s/g, '+') : '').join(',+');
         const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json`;
         fetch(url).then(response => response.json()).then((result) => {
            const first = _.first(result) || {};
            const position = [+first.lat, +first.lon];
            this.setState({ position });
         });
      }
   },

   onChange(mission) {
      this.toggleEdit();
      this.props.onChange(mission);
   },

   toggleEdit() {
      const isEditing = !this.state.isEditing;
      this.setState({ isEditing });
   },

   renderCrew(crew) {
      if (_.isEmpty(crew)) return null;

      const rows = _.map(crew, (assignment) => {
         const volunteer = this.context.volunteers
            ? this.context.volunteers[assignment.volunteer]
            : assignment.volunteer;

         return (
            <tr key={volunteer.id}>
               <td><Pill label={assignment.status} type={statusMap[assignment.status]} /></td>
               <td>{_.startCase(volunteer.group)}</td>
               <td>{volunteer.name.first} {volunteer.name.last}</td>
            </tr>
         );
      });

      return (
         <Table style={{ tableLayout: 'fixed' }}>
            <thead>
               <tr><th>Status</th><th>Group</th><th>Name</th></tr>
            </thead>
            <tbody>{rows}</tbody>
         </Table>
      );
   },

   renderReadView() {
      const mission = this.props.mission;
      const area = mission.area ? mission.area.name : '';
      const position = this.state.position;
      const right = { float: 'right' };

      return (
         <Card>
            {this.props.isEditable
               ? <Button onClick={this.toggleEdit} style={right}>Edit</Button>
               : <Pill label={mission.status} type="info" style={right} />
            }
            <h2>{mission.name} in {area} from {formatDate(mission.start)} till {formatDate(mission.end)}</h2>

            {this.renderCrew(mission.crew)}

            {position &&
               <Map center={position} zoom={this.state.zoom}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
               </Map>
            }
         </Card>
      );
   },

   renderEditView() {
      return (
         <Card>
            <MissionForm mission={this.props.mission} onChange={this.onChange} />
         </Card>
      );
   },

   render() {
      return this.state.isEditing
         ? this.renderEditView()
         : this.renderReadView();
   },

});
