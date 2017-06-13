import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import { Alert, Card, Table, ButtonGroup, Button, Pill } from 'elemental';
import { Map, TileLayer } from 'react-leaflet';
import MissionForm from './MissionForm';
import CommentForm from './CommentForm';
import EmailEditor from './EmailEditor';
import * as http from '../lib/http';
import formData from '../lib/formData';

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
      volunteer: React.PropTypes.object,
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
         isDrafting: false,
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
            if (!result.length) return;
            const first = _.first(result);
            const position = [+first.lat, +first.lon];
            this.setState({ position });
         });
      }
   },

   onChange(mission) {
      this.toggleEdit();
      this.props.onChange(mission);
   },

   setMessage(text, type) {
      this.setState({ message: { text, type } });
      _.delay(() => this.setState({ message: null }), 5000);
   },

   setMissionState(status) {
      const mission = this.props.mission;
      http.put(`/api/volunteer/missions/${mission.id}?status=${status}`)
         .then(({ commitmentMessage, log }) => {
            mission.commitmentMessage = commitmentMessage;
            mission.log = log;
            mission.crew.find(a => a.volunteer.id === this.context.volunteer.id).status = status;
            this.props.onChange(mission);
         })
         .catch(({ error }) => this.setMessage(error, 'danger'));
   },

   toggleEdit() {
      const isEditing = !this.state.isEditing;
      this.setState({ isEditing });
   },

   toggleMessage() {
      const isDrafting = !this.state.isDrafting;
      this.setState({ isDrafting });
   },

   renderEmailEditor() {
      const mission = this.props.mission;
      const contacts = mission.crew.map((assignment) => {
         const volunteer = this.context.volunteers ? this.context.volunteers[assignment.volunteer] : assignment.volunteer;
         return {
            value: volunteer.id,
            label: [volunteer.name.first, volunteer.name.last].join(' ').trim(),
            isRecipient: assignment.status === 'yes',
         };
      });

      return <EmailEditor mission={mission} contacts={contacts} onClose={this.toggleMessage} />;
   },

   renderHeadOfMission() {
      let headOfMission = this.context.volunteers && this.context.volunteers[this.props.mission.headOfMission] || {};
      headOfMission = headOfMission.name ? `${headOfMission.name.first} ${headOfMission.name.last}` : '';

      return headOfMission ? <h4>Head of Mission: {headOfMission}</h4> : null;
   },

   renderStatusButtons() {
      const myAssignment = this.props.mission.crew.find(a => _.get(a, 'volunteer.id') === (this.context.volunteer ? this.context.volunteer.id : null));
      const buttonClass = status => status === myAssignment.status ? 'default-primary' : 'default';

      if (!myAssignment) return null;

      return (
         <div style={{ textAlign: 'right', marginBottom: '1em' }}>
            <ButtonGroup style={{ marginLeft: '1em' }}>
               <Button type="default" disabled>Change your participation state:</Button>
               <Button type={buttonClass('yes')} onClick={() => this.setMissionState('yes')}>Yes</Button>
               <Button type={buttonClass('pending')} onClick={() => this.setMissionState('pending')}>Undecided</Button>
               <Button type={buttonClass('no')} onClick={() => this.setMissionState('no')}>No</Button>
            </ButtonGroup>
         </div>
      );
   },

   renderLogs() {
      const mission = this.props.mission;
      const hasCommitmentMessage = mission.commitmentMessage && mission.commitmentMessage.html;
      const hasLog = mission.log && mission.log.length;

      if (!hasCommitmentMessage && !hasLog) return null;

      return (
         <div>
            {hasCommitmentMessage &&
               <div>
                  <hr />
                  <div dangerouslySetInnerHTML={{ __html: mission.commitmentMessage.html }} />
               </div>
            }
            {_.map(mission.log, ({ createdAt, subject, content }) =>
               <div key={createdAt}>
                  <hr />
                  <p><strong>{subject}</strong> from {formatDate(createdAt)}</p>
                  <p dangerouslySetInnerHTML={{ __html: content ? content.html : '<i>Error</i>' }} />
               </div>
            )}
         </div>
      );
   },

   renderCrew(crew) {
      if (_.isEmpty(crew)) return null;

      const saveComment = assignment => (comment) => {
         assignment.comment = comment;
         const body = formData({ crew: this.props.mission.crew });
         return http.put(`/api/missions/${this.props.mission.id}`, { body }).catch(_.noop); // meh
      };
      const rows = [];

      _.each(crew, (assignment) => {
         const volunteer = (this.context.volunteers
            ? this.context.volunteers[assignment.volunteer]
            : assignment.volunteer) || {};

         rows.push(
            <tr key={assignment._id}>
               <td><Pill label={assignment.status} type={statusMap[assignment.status]} /></td>
               <td>{_.startCase(volunteer.group)}</td>
               <td>{_.get(volunteer, 'name.first')} {_.get(volunteer, 'name.last')}</td>
            </tr>
         );

         if (this.props.isEditable) {
            rows.push(
               <tr key={`${assignment._id}-comment`}>
                  <td colSpan="3">
                     <CommentForm comment={assignment.comment} onChange={saveComment(assignment)} />
                  </td>
               </tr>
            );
         }
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
            {this.state.message &&
               <Alert type={this.state.message.type}>{this.state.message.text}</Alert>
            }

            {this.props.isEditable
               ? <ButtonGroup style={right}>
                     <Button onClick={this.toggleMessage}>Send Message</Button>
                     <Button onClick={this.toggleEdit}>Edit Mission</Button>
                  </ButtonGroup>
               : <Pill label={mission.status} type="info" style={right} />
            }

            {this.state.isDrafting && this.renderEmailEditor()}

            <h2>{mission.name} {area && `in ${area}`} from {formatDate(mission.start)} till {formatDate(mission.end)}</h2>

            {this.renderHeadOfMission()}

            {mission.description && mission.description.html &&
               <p dangerouslySetInnerHTML={{ __html: mission.description.html }} />
            }

            {this.renderStatusButtons()}

            {this.renderCrew(mission.crew)}

            {position &&
               <Map center={position} zoom={this.state.zoom}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
               </Map>
            }

            {this.renderLogs()}
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
