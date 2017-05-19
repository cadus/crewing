import React from 'react';
import _ from 'lodash';
import Timeline from 'react-calendar-timeline';
import moment from 'moment';
import { Alert, Button, Spinner } from 'elemental';
import DateInput from './DateInput';
import EmailEditor from './EmailEditor';
import * as http from '../lib/http';
import groupsJSON from '../../shared/groups.json';

export default React.createClass({

   propTypes: {
      start: React.PropTypes.number,
      end: React.PropTypes.number,
   },

   getDefaultProps() {
      return {
         start: Date.now(),
         end: Date.now(),
      };
   },

   getInitialState() {
      return {
         start: this.props.start,
         end: this.props.end,
         items: [],
         groups: groupsJSON.map(name => ({ id: name, title: _.startCase(name), isActive: true })),
         showSettings: false,
         isDrafting: false,
         volunteers: null,
         error: null,
      };
   },

   componentDidMount() {
      http.get('/api/volunteers')
         .then(({ volunteers }) => this.setState({ volunteers }, this.generateItems))
         .catch(({ error }) => this.setState({ error }));
   },

   generateItems() {
      const items = [];
      const now = new Date();
      const start = new Date(this.state.start);
      const end = new Date(this.state.end);

      _.each(this.state.volunteers, volunteer => _.each(volunteer.availabilities, (av) => {
         const className = new Date(av.from) <= start && new Date(av.till) >= end
            ? new Date(av.confirmationTill || now) >= now ? 'available' : 'expired'
            : 'unavailable';

         items.push({
            start_time: moment(av.from),
            end_time: moment(av.till),
            id: av._id,
            group: volunteer.group,
            title: `${volunteer.name.first || ''} ${volunteer.name.last || ''}`.trim(),
            volunteer: volunteer.id,
            className,
         });
      }));

      this.setState({ items });
   },

   changeDate(newState) {
      this.setState(newState, this.generateItems);
   },

   toggleEmailDrafting() {
      this.setState({ isDrafting: !this.state.isDrafting });
   },

   renderNav() {
      const toggle = () => this.setState({ showSettings: !this.state.showSettings });

      if (!this.state.showSettings) {
         return <div className="settings-toggle" onClick={toggle}>⋮</div>;
      }

      const start = moment(this.state.start);
      const end = moment(this.state.end);
      const Grid = props => <div style={{ display: 'flex', padding: '1rem' }}>{props.children}</div>;
      const Cell = props => <div style={{ marginRight: '1rem' }}>{props.children}</div>;

      return (
         <Grid>
            <Cell>
               <DateInput
                  inline
                  defaultValue={start}
                  onChange={value => this.changeDate({ start: value })}
               />
            </Cell>
            <Cell>
               <DateInput
                  inline
                  defaultValue={end}
                  onChange={value => this.changeDate({ end: value })}
               />
            </Cell>
            <Cell>
               {this.renderGroups()}
               <Button type="default" onClick={this.toggleEmailDrafting}>Draft an Email</Button>
               <Button type="default" style={{ float: 'right' }} onClick={toggle}>Close Settings</Button>
            </Cell>
         </Grid>
      );
   },

   renderGroups() {
      const groups = this.state.groups;

      const onChange = (event) => {
         const group = _.find(groups, { id: event.target.name });
         group.isActive = event.target.checked;
         this.setState({ groups });
      };

      return (
         <fieldset style={{ marginBottom: '1rem' }}>
            <legend>Groups</legend>
            <form onChange={onChange} style={{ columnCount: 2 }}>
               {_.map(groups, ({ id, title, isActive }) =>
                  <label key={id} style={{ display: 'block' }}>
                     <input type="checkbox" defaultChecked={isActive} name={id} /> {title}
                  </label>
               )}
            </form>
         </fieldset>
      );
   },

   render() {
      if (this.state.error) {
         return (
            <div className="container" style={{ marginTop: 100 }}>
               <Alert type="danger"><strong>Error:</strong> {this.state.error}</Alert>
            </div>
         );
      }

      if (this.state.volunteers === null) {
         return <div style={{ marginTop: 100, textAlign: 'center' }}><Spinner size="lg" /></div>;
      }

      const start = moment(this.state.start);
      const end = moment(this.state.end);
      const groups = _.filter(this.state.groups, 'isActive');
      const contacts = _.uniqBy(this.state.items.map(({ volunteer, title, className }) =>
         ({ value: volunteer, label: title, isRecipient: className === 'available' })), 'value');

      return (
         <div>
            {this.renderNav()}
            {this.state.isDrafting &&
               <EmailEditor contacts={contacts} onClose={this.toggleEmailDrafting} />
            }
            <Timeline
               groups={groups}
               items={this.state.items}
               defaultTimeStart={start.add(-1, 'day')}
               defaultTimeEnd={end.add(1, 'day')}
               canMove={false}
               canChangeGroup={false}
               canResize={false}
               stackItems
            />
         </div>
      );
   },

});
